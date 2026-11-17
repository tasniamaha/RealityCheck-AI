"""
auth_api.py
------------
Login, sign-up and live field checks for the React forms.

  POST /api/auth/check/  { mode: register|login, username?, email?, password? }
       Checks each field it is given and says what is wrong, so the form can
       show it while the user types. It never checks a password against an
       account: that only happens on login, and wrong tries are rate-limited.
  POST /api/auth/login/     { username, password }
  POST /api/auth/register/  { name, username, email, password }
"""

import json
import re

from django.contrib.auth import authenticate, login, password_validation
from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

USERNAME_RE = re.compile(r'^[\w.@+-]{3,150}$')
MAX_FAILS = 5            # wrong passwords allowed ...
LOCK_SECONDS = 5 * 60    # ... before a 5-minute pause


def _json(data, status=200):
    return JsonResponse(data, status=status)


def _role(user):
    if user.is_staff:
        return 'admin'
    if user.groups.filter(name='Experts').exists():
        return 'expert'
    return 'user'


def _user_json(user):
    return {'id': user.id, 'username': user.username, 'email': user.email,
            'name': user.get_full_name() or user.username, 'role': _role(user)}


def _find_user(username):
    """Exact match first, then case-insensitive, so 'Admin' finds 'admin'."""
    return (User.objects.filter(username=username).first()
            or User.objects.filter(username__iexact=username).first())


# -- Field checks ----------------------------------------------------------------

def check_username(username, mode):
    if not username:
        return {'ok': False, 'message': 'Enter a username.'}
    if mode == 'login':
        if _find_user(username):
            return {'ok': True, 'message': 'Account found.'}
        return {'ok': False, 'message': 'No account with this username.'}
    if not USERNAME_RE.match(username):
        return {'ok': False, 'message': 'Use 3 or more letters, numbers or . @ + - _ (no spaces).'}
    if User.objects.filter(username__iexact=username).exists():
        return {'ok': False, 'message': 'This username is taken.'}
    return {'ok': True, 'message': 'Username is available.'}


def check_email(email):
    if not email:
        return {'ok': False, 'message': 'Enter your email.'}
    try:
        validate_email(email)
    except ValidationError:
        return {'ok': False, 'message': 'This does not look like an email address.'}
    if User.objects.filter(email__iexact=email).exists():
        return {'ok': False, 'message': 'An account with this email already exists.'}
    return {'ok': True, 'message': 'Email looks good.'}


def check_password(password, username='', email=''):
    if not password:
        return {'ok': False, 'messages': ['Enter a password.']}
    try:
        password_validation.validate_password(password, User(username=username, email=email))
    except ValidationError as e:
        return {'ok': False, 'messages': list(e.messages)}
    return {'ok': True, 'messages': ['Strong enough.']}


@csrf_exempt
def api_auth_check(request):
    # POST, so a password being typed never ends up in a URL or the server log.
    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)
    try:
        q = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)
    q = {k: str(v) for k, v in q.items() if v is not None}
    mode = q.get('mode', 'register')
    out = {}
    if 'username' in q:
        out['username'] = check_username(q['username'].strip(), mode)
    if 'email' in q and mode == 'register':
        out['email'] = check_email(q['email'].strip())
    if 'password' in q and mode == 'register':
        out['password'] = check_password(q['password'], q.get('username', ''), q.get('email', ''))
    return _json(out)


# -- Login -------------------------------------------------------------------------

def _fail_key(request, username):
    ip = request.META.get('REMOTE_ADDR', '')
    return f'login-fails:{ip}:{username.lower()}'


@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    username = str(body.get('username', '')).strip()
    password = str(body.get('password', ''))
    errors = {}
    if not username:
        errors['username'] = 'Enter your username.'
    if not password:
        errors['password'] = 'Enter your password.'
    if errors:
        return _json({'error': 'Please fill in both fields.', 'fields': errors}, status=400)

    key = _fail_key(request, username)
    fails = cache.get(key, 0)
    if fails >= MAX_FAILS:
        return _json({'error': 'Too many wrong passwords. Wait 5 minutes and try again.',
                      'fields': {'password': 'Locked for 5 minutes.'}}, status=429)

    account = _find_user(username)
    if account is None:
        return _json({'error': 'No account with this username.',
                      'fields': {'username': 'No account with this username.'}}, status=401)

    user = authenticate(request, username=account.username, password=password)
    if user is None:
        fails += 1
        cache.set(key, fails, LOCK_SECONDS)
        left = MAX_FAILS - fails
        msg = 'Wrong password.' + (f' {left} tr{"y" if left == 1 else "ies"} left.' if left > 0 else '')
        if not account.is_active:
            msg = 'This account is switched off. Contact the admin.'
        return _json({'error': msg, 'fields': {'password': msg}}, status=401)

    cache.delete(key)
    login(request, user)
    return _json(_user_json(user))


# -- Sign up -----------------------------------------------------------------------

@csrf_exempt
def api_register(request):
    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    name = str(body.get('name', '')).strip()
    username = str(body.get('username', '')).strip()
    email = str(body.get('email', '')).strip()
    password = str(body.get('password', ''))

    fields = {}
    if not name:
        fields['name'] = 'Enter your full name.'
    u = check_username(username, 'register')
    if not u['ok']:
        fields['username'] = u['message']
    e = check_email(email)
    if not e['ok']:
        fields['email'] = e['message']
    p = check_password(password, username, email)
    if not p['ok']:
        fields['password'] = ' '.join(p['messages'])
    if fields:
        return _json({'error': 'Please fix the highlighted fields.', 'fields': fields}, status=400)

    parts = name.split()
    user = User.objects.create_user(username=username, email=email, password=password,
                                    first_name=parts[0] if parts else '',
                                    last_name=' '.join(parts[1:]))
    login(request, user)
    return _json(_user_json(user))
