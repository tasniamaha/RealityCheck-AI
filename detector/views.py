import os
import tempfile
import json
import hashlib
import urllib.request
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.contrib import messages
from django.core.files.base import ContentFile
from PIL import Image

from detector.models import ScanResult, ExpertReview, ExpertApplication
from detector.image_detector import analyze_image
from detector.video_detector import analyze_video

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.tif'}
VIDEO_EXTS = {'.mp4', '.avi', '.mov', '.mkv'}


def _cors(response):
    """Add CORS headers to a response."""
    response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response['Access-Control-Allow-Credentials'] = 'true'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
    return response


def _json(data, status=200):
    return _cors(JsonResponse(data, status=status))


def _compute_file_hash(file_bytes):
    """Compute SHA256 hash of file for duplicate detection."""
    return hashlib.sha256(file_bytes).hexdigest()


def _prob_verdict(prob):
    if prob is None:
        return 'SKIPPED'
    from detector.image_detector import _verdict
    return _verdict(prob)


def _score_kwargs(probs):
    """Map {model_name: fake_prob} to ScanResult columns."""
    from detector.image_detector import SCORE_FIELDS
    return {field: probs.get(name) for name, field in SCORE_FIELDS.items()}


def _cached_model_results(scan):
    from detector import image_detector as det
    results = []
    for name, _ in det.active_runners():
        prob = getattr(scan, det.SCORE_FIELDS[name], None)
        results.append({'model_name': name, 'fake_prob': prob,
                        'real_prob': None if prob is None else round(100 - prob, 2),
                        'verdict': _prob_verdict(prob)})
    return results


def _model_scores(scan):
    """Short name + stored fake score for every enabled model (expert dashboard)."""
    from detector import image_detector as det
    from detector.explain import SHORT
    return [{'name': SHORT.get(name, name), 'fake_prob': getattr(scan, det.SCORE_FIELDS[name], None)}
            for name, _ in det.active_runners()]


def is_expert(user):
    return user.is_authenticated and (
        user.groups.filter(name='Experts').exists() or user.is_staff
    )


def is_admin(user):
    return user.is_authenticated and user.is_staff


def can_view_scan(user, scan):
    """Owner, experts and admins. Old scans with no owner stay visible to logged-in users."""
    if not user.is_authenticated:
        return False
    if is_expert(user) or scan.uploaded_by_id is None or scan.uploaded_by_id == user.id:
        return True
    return False


# ── CORS preflight ─────────────────────────────────────────────────────────────

@csrf_exempt
def cors_preflight(request):
    """Handle OPTIONS preflight for all API routes."""
    response = JsonResponse({})
    return _cors(response)


# ── Public: upload & detect ───────────────────────────────────────────────────

def index(request):
    recent = ScanResult.objects.all()[:10]
    return render(request, 'detector/index.html', {'recent': recent})


@csrf_exempt
@require_POST
def detect(request):
    """
    Enhanced detection endpoint with:
    1. File hash computation for duplicate detection
    2. Caching of results from identical files
    3. Media preview URL generation
    """
    if not request.user.is_authenticated:
        return _json({'error': 'Please log in to analyse files.'}, status=401)
    uploaded = request.FILES.get('file')
    if not uploaded:
        return _json({'error': 'No file uploaded.'}, status=400)

    ext      = os.path.splitext(uploaded.name)[1].lower()
    filename = uploaded.name
    file_bytes = uploaded.read()

    # Compute file hash for duplicate detection
    file_hash = _compute_file_hash(file_bytes)

    # Check if this exact file has been analyzed before
    existing_scan = ScanResult.objects.filter(file_hash=file_hash, is_cached_result=False).first()
    
    if existing_scan and existing_scan.status == 'REVIEWED':
        # This is a duplicate of a previously analyzed file - return cached result
        # Give this user their own record that points at the reviewed original,
        # so they can open it, see the explanations and file a complaint.
        copy = ScanResult.objects.create(
            media_type=existing_scan.media_type, file_name=filename, file_hash=file_hash,
            uploaded_by=request.user, is_cached_result=True, original_scan=existing_scan,
            media_file=existing_scan.media_file.name if existing_scan.media_file else None,
            **{f: getattr(existing_scan, f) for f in (
                'siglip_prob', 'xception_prob', 'efficientnet_prob', 'aihuman_prob', 'openfake_prob', 'expert_prob',
                'model_ensemble_prob', 'model_ensemble_verdict', 'provenance_note',
                'final_verdict', 'final_confidence')},
            status='REVIEWED',
        )
        return _json({
            'status':              'REVIEWED',  # Mark as already reviewed
            'scan_id':             copy.id,
            'file_name':           filename,
            'media_type':          existing_scan.media_type,
            'is_cached_result':    True,
            'original_scan_id':    existing_scan.id,
            'message':             'This file has been analyzed before. Using cached result.',
            'model_results':       _cached_model_results(existing_scan),
            'ai_label':            existing_scan.model_ensemble_verdict,
            'ensemble':            {
                'model_name': 'Ensemble (Average)',
                'fake_prob':  existing_scan.model_ensemble_prob,
                'real_prob':  round(100 - existing_scan.model_ensemble_prob, 2) if existing_scan.model_ensemble_prob else None,
                'verdict':    existing_scan.model_ensemble_verdict,
            },
            'final_verdict':       existing_scan.final_verdict,
            'final_confidence':    existing_scan.final_confidence,
        })

    # Process new file
    if ext in IMAGE_EXTS:
        try:
            import io
            image  = Image.open(io.BytesIO(file_bytes)).convert('RGB')
            result = analyze_image(image, filename=filename)
        except Exception as e:
            return _json({'error': f'Image processing failed: {e}'}, status=500)

    elif ext in VIDEO_EXTS:
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            result = analyze_video(tmp_path)
        except Exception as e:
            return _json({'error': f'Video processing failed: {e}'}, status=500)
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
    else:
        return _json({'error': f'Unsupported file type: {ext}'}, status=400)

    if 'error' in result:
        return _json(result, status=500)

    probs = {r['model_name']: r.get('fake_prob') for r in result.get('model_results', [])}
    ens   = result.get('ensemble', {})

    # An AI label written into the file itself outranks the detectors.
    from detector.provenance import check_provenance
    provenance = check_provenance(file_bytes)
    if provenance['ai_generated']:
        ens['verdict'] = 'FAKE'

    # Create new scan record with file hash
    scan = ScanResult(
        media_type             = result.get('media_type', 'image'),
        file_name              = filename,
        file_hash              = file_hash,  # Store hash for duplicate detection
        uploaded_by            = request.user,
        **_score_kwargs(probs),
        provenance_note        = provenance['note'],
        model_ensemble_prob    = ens.get('fake_prob'),
        model_ensemble_verdict = ens.get('verdict', ''),
        status                 = 'PENDING',
        is_cached_result       = False,
    )
    scan.save()
    scan.media_file.save(filename, ContentFile(file_bytes), save=True)

    result['status']  = 'PENDING'
    result['scan_id'] = scan.id
    result['file_name'] = filename
    result['is_cached_result'] = False
    result['message'] = 'AI analysis complete. Awaiting expert review for final verdict.'
    result['ai_label']   = scan.model_ensemble_verdict
    result['provenance'] = provenance
    result['ensemble']['verdict'] = 'PENDING'

    return _json(result)


def scan_status(request, scan_id):
    """Get the current status of a scan, including expert verdict when ready."""
    scan = get_object_or_404(ScanResult, id=scan_id)
    if not can_view_scan(request.user, scan):
        return _json({'error': 'You cannot view this scan.'}, status=403)

    # Build media URL for preview
    media_url = None
    if scan.media_file:
        media_url = scan.media_file.url
    
    data = {
        'scan_id':          scan.id,
        'status':           scan.status,
        'file_name':        scan.file_name,
        'media_type':       scan.media_type,
        'media_url':        media_url,
        'final_verdict':    scan.final_verdict if scan.status == 'REVIEWED' else 'PENDING',
        'final_confidence': scan.final_confidence,
        'is_cached':        scan.is_cached_result,
    }
    return _json(data)


# ── Auth API ──────────────────────────────────────────────────────────────────

@csrf_exempt
def api_login(request):
    """POST /api/auth/login/  { username, password }"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)

    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    username = body.get('username', '').strip()
    password = body.get('password', '')
    user = authenticate(request, username=username, password=password)

    if not user:
        return _json({'error': 'Invalid credentials'}, status=401)

    login(request, user)

    role = 'user'
    if user.is_staff:
        role = 'admin'
    elif user.groups.filter(name='Experts').exists():
        role = 'expert'

    return _json({
        'id':       user.id,
        'username': user.username,
        'email':    user.email,
        'name':     user.get_full_name() or user.username,
        'role':     role,
    })


@csrf_exempt
def api_logout(request):
    """POST /api/auth/logout/"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    logout(request)
    return _json({'ok': True})


@csrf_exempt
def api_me(request):
    """GET /api/auth/me/  — returns current session user"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not request.user.is_authenticated:
        return _json({'error': 'Not authenticated'}, status=401)

    user = request.user
    role = 'user'
    if user.is_staff:
        role = 'admin'
    elif user.groups.filter(name='Experts').exists():
        role = 'expert'

    return _json({
        'id':       user.id,
        'username': user.username,
        'email':    user.email,
        'name':     user.get_full_name() or user.username,
        'role':     role,
    })


@csrf_exempt
def api_register(request):
    """POST /api/auth/register/  { username, email, password, name }"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)

    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    username = body.get('username', '').strip()
    email    = body.get('email', '').strip()
    password = body.get('password', '')
    name     = body.get('name', '').strip()

    if not username or not email or not password:
        return _json({'error': 'Username, email and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return _json({'error': 'Username already taken.'}, status=409)

    if User.objects.filter(email=email).exists():
        return _json({'error': 'Email already registered.'}, status=409)

    if len(password) < 6:
        return _json({'error': 'Password must be at least 6 characters.'}, status=400)

    user = User.objects.create_user(
        username   = username,
        email      = email,
        password   = password,
        first_name = name.split()[0] if name else '',
        last_name  = ' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
    )

    login(request, user)

    return _json({
        'id':       user.id,
        'username': user.username,
        'email':    user.email,
        'name':     user.get_full_name() or user.username,
        'role':     'user',
    })


@csrf_exempt
def api_expert_register(request):
    """
    POST /api/auth/expert-register/  
    { name, email, username, password, experience, education, q1, q2, q3 }
    
    Creates both the ExpertApplication AND a Django User immediately.
    """
    if request.method == 'OPTIONS':
        return cors_preflight(request)

    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    name       = body.get('name', '').strip()
    email      = body.get('email', '').strip()
    username   = body.get('username', '').strip()
    password   = body.get('password', '')
    experience = body.get('experience', '').strip()
    education  = body.get('education', '').strip()
    q1         = body.get('q1', '').strip()
    q2         = body.get('q2', '').strip()
    q3         = body.get('q3', '').strip()

    if not all([name, email, username, password, q1, q2]):
        return _json({'error': 'Name, email, username, password, and assessment answers are required.'}, status=400)

    if len(password) < 6:
        return _json({'error': 'Password must be at least 6 characters.'}, status=400)

    if User.objects.filter(username=username).exists():
        return _json({'error': 'Username already taken.'}, status=409)

    if User.objects.filter(email=email).exists():
        return _json({'error': 'Email already registered.'}, status=409)

    if ExpertApplication.objects.filter(email=email).exists():
        return _json({'error': 'You have already applied.'}, status=409)

    try:
        # Create the user account but do NOT add to Experts group yet.
        # They stay as a regular user until admin approves their application.
        user = User.objects.create_user(
            username   = username,
            email      = email,
            password   = password,
            first_name = name.split()[0] if name else '',
            last_name  = ' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
        )

        # Record the application as Pending — admin must approve
        ExpertApplication.objects.create(
            name       = name,
            email      = email,
            experience = experience,
            education  = education,
            q1         = q1,
            q2         = q2,
            q3         = q3,
            status     = 'Pending',
        )

        login(request, user)

        return _json({
            'id':       user.id,
            'username': user.username,
            'email':    user.email,
            'name':     user.get_full_name() or user.username,
            'role':     'user',          # regular user until admin approves
            'pending_expert': True,      # flag so frontend can show waiting message
            'message':  'Application submitted! Your account is ready but expert access is pending admin approval.',
        }, status=201)

    except Exception as e:
        return _json({'error': f'Registration failed: {str(e)}'}, status=500)


# ── Expert API ────────────────────────────────────────────────────────────────

@csrf_exempt
def api_expert_queue(request):
    """
    GET /api/expert/queue/  
    Returns pending & reviewed cases with media URLs for preview
    """
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not request.user.is_authenticated or not is_expert(request.user):
        return _json({'error': 'Expert access required'}, status=403)

    pending = []
    for scan in ScanResult.objects.filter(status='PENDING').order_by('-uploaded_at'):
        media_url = scan.media_file.url if scan.media_file else None
        pending.append({
            'id':           scan.id,
            'file_name':    scan.file_name,
            'media_type':   scan.media_type,
            'status':       scan.status,
            'uploaded_at':  scan.uploaded_at.isoformat(),
            'media_url':    media_url,  # URL for preview
            'model_scores': _model_scores(scan),
            'provenance':   scan.provenance_note,
        })

    reviewed = []
    for scan in ScanResult.objects.filter(status='REVIEWED', expert_review__expert=request.user).order_by('-uploaded_at')[:20]:
        media_url = scan.media_file.url if scan.media_file else None
        reviewed.append({
            'id':               scan.id,
            'file_name':        scan.file_name,
            'media_type':       scan.media_type,
            'status':           scan.status,
            'final_verdict':    scan.final_verdict,
            'final_confidence': scan.final_confidence,
            'uploaded_at':      scan.uploaded_at.isoformat(),
            'media_url':        media_url,  # URL for preview
        })

    return _json({'pending': pending, 'reviewed': reviewed})


@csrf_exempt
def api_expert_review(request, scan_id):
    """POST /api/expert/review/<id>/  { verdict, confidence, reasoning }"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not request.user.is_authenticated or not is_expert(request.user):
        return _json({'error': 'Expert access required'}, status=403)

    scan = get_object_or_404(ScanResult, id=scan_id)
    if scan.status == 'REVIEWED':
        return _json({'error': 'Already reviewed'}, status=400)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    verdict    = body.get('verdict', '').upper()
    confidence = body.get('confidence')
    reasoning  = body.get('reasoning', '').strip()
    if verdict == 'FAKE' and not reasoning:
        return _json({'error': 'Write why this file is fake. Experts giving the same reason teach the expert-trained detector.'}, status=400)

    if verdict not in ('FAKE', 'REAL', 'UNCERTAIN'):
        return _json({'error': 'Invalid verdict'}, status=400)

    try:
        confidence = int(confidence)
        if confidence not in range(1, 6):
            raise ValueError
    except (TypeError, ValueError):
        return _json({'error': 'Confidence must be 1–5'}, status=400)

    review = ExpertReview.objects.create(
        expert=request.user,
        verdict=verdict,
        confidence=confidence,
        reasoning=reasoning,
    )
    scan.expert_review = review
    scan.save()
    scan.compute_final_verdict()

    try:
        from detector import learning
        learning.maybe_start()
    except Exception as exc:
        print(f'[Learning] check failed: {exc}')

    return _json({
        'ok':             True,
        'final_verdict':  scan.final_verdict,
        'final_confidence': scan.final_confidence,
    })


# ── Admin API ─────────────────────────────────────────────────────────────────

@csrf_exempt
def api_admin_applications(request):
    """
    GET  /api/admin/applications/  — list all expert applications
    POST /api/admin/applications/  — submit a new expert application (public)
    """
    if request.method == 'OPTIONS':
        return cors_preflight(request)

    if request.method == 'POST':
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return _json({'error': 'Invalid JSON'}, status=400)

        app = ExpertApplication.objects.create(
            name       = body.get('name', ''),
            email      = body.get('email', ''),
            experience = body.get('experience', ''),
            education  = body.get('education', ''),
            q1         = body.get('q1', ''),
            q2         = body.get('q2', ''),
            q3         = body.get('q3', ''),
        )
        return _json({'ok': True, 'id': app.id}, status=201)

    if not request.user.is_authenticated or not is_admin(request.user):
        return _json({'error': 'Admin access required'}, status=403)

    apps = list(ExpertApplication.objects.order_by('-applied_at').values(
        'id', 'name', 'email', 'experience', 'education',
        'q1', 'q2', 'q3', 'status', 'applied_at',
    ))
    for a in apps:
        a['applied_at'] = a['applied_at'].isoformat()
    return _json({'applications': apps})


@csrf_exempt
def api_admin_application_action(request, app_id):
    """POST /api/admin/applications/<id>/action/  { action: 'approve'|'reject' }"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not request.user.is_authenticated or not is_admin(request.user):
        return _json({'error': 'Admin access required'}, status=403)

    app = get_object_or_404(ExpertApplication, id=app_id)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    action = body.get('action', '').lower()
    if action not in ('approve', 'reject'):
        return _json({'error': 'action must be approve or reject'}, status=400)

    if action == 'approve':
        app.status = 'Approved'
        app.save()

        # Find the existing user created during expert registration
        user = User.objects.filter(email=app.email).first()
        if not user:
            return _json({'error': 'No user account found for this email. The applicant may not have registered yet.'}, status=404)

        # Grant expert access by adding to the Experts group
        experts_group, _ = Group.objects.get_or_create(name='Experts')
        user.groups.add(experts_group)

        return _json({
            'ok':      True,
            'status':  'Approved',
            'username': user.username,
            'message': f'{user.username} has been granted expert access.',
        })
    else:
        app.status = 'Rejected'
        app.save()
        # Remove from Experts group if they somehow had access
        user = User.objects.filter(email=app.email).first()
        if user:
            experts_group = Group.objects.filter(name='Experts').first()
            if experts_group:
                user.groups.remove(experts_group)
        return _json({'ok': True, 'status': 'Rejected'})


@csrf_exempt
def api_admin_scans(request):
    """GET /api/admin/scans/  — all scans with stats"""
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not request.user.is_authenticated or not is_admin(request.user):
        return _json({'error': 'Admin access required'}, status=403)

    scans = list(ScanResult.objects.order_by('-uploaded_at')[:50].values(
        'id', 'file_name', 'media_type', 'status',
        'model_ensemble_verdict', 'final_verdict', 'final_confidence', 'uploaded_at',
    ))
    for s in scans:
        s['uploaded_at'] = s['uploaded_at'].isoformat()
    return _json({'scans': scans})


# ── Legacy Django-template expert views (kept for admin site) ─────────────────

def expert_login(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user     = authenticate(request, username=username, password=password)
        if user and is_expert(user):
            login(request, user)
            return redirect('expert_queue')
        else:
            messages.error(request, 'Invalid credentials or insufficient permissions.')
    return render(request, 'detector/expert_login.html')


def expert_logout(request):
    logout(request)
    return redirect('index')


@login_required(login_url='expert_login')
@user_passes_test(is_expert, login_url='expert_login')
def expert_queue(request):
    pending  = ScanResult.objects.filter(status='PENDING').order_by('-uploaded_at')
    reviewed = ScanResult.objects.filter(status='REVIEWED').order_by('-uploaded_at')[:20]
    return render(request, 'detector/expert_queue.html', {
        'pending':  pending,
        'reviewed': reviewed,
        'expert':   request.user,
    })


@login_required(login_url='expert_login')
@user_passes_test(is_expert, login_url='expert_login')
def expert_review(request, scan_id):
    scan = get_object_or_404(ScanResult, id=scan_id)
    if scan.status == 'REVIEWED':
        messages.info(request, f'Scan #{scan_id} has already been reviewed.')
        return redirect('expert_queue')

    if request.method == 'POST':
        verdict    = request.POST.get('verdict', '').upper()
        confidence = request.POST.get('confidence')
        reasoning  = request.POST.get('reasoning', '').strip()

        if verdict not in ('FAKE', 'REAL', 'UNCERTAIN'):
            messages.error(request, 'Please select a valid verdict.')
            return redirect('expert_review', scan_id=scan_id)

        try:
            confidence = int(confidence)
            if confidence not in range(1, 6):
                raise ValueError
        except (TypeError, ValueError):
            messages.error(request, 'Please select a confidence level.')
            return redirect('expert_review', scan_id=scan_id)

        review = ExpertReview.objects.create(
            expert=request.user, verdict=verdict,
            confidence=confidence, reasoning=reasoning,
        )
        scan.expert_review = review
        scan.save()
        scan.compute_final_verdict()
        messages.success(request, f'Review submitted. Final verdict: {scan.final_verdict}')
        return redirect('expert_queue')

    is_video = scan.media_type == 'video'
    return render(request, 'detector/expert_review.html', {
        'scan': scan, 'is_video': is_video, 'expert': request.user,
    })

# ── Claude API proxy: model voice generation ──────────────────────────────────


# Model explanations: scores + Grad-CAM heatmap, no generated text.
from detector.explain import api_model_voice  # noqa: E402,F401
from detector.learning_api import api_admin_learning  # noqa: E402,F401



# -- Complaints ------------------------------------------------------------------

def _complaint_json(c):
    return {
        'id':         c.id,
        'scan_id':    c.scan_id,
        'reporter':   c.reporter.username if c.reporter else None,
        'reason':     c.reason,
        'details':    c.details,
        'status':     c.status,
        'created_at': c.created_at.isoformat(),
    }


@csrf_exempt
def api_complaints(request):
    """
    POST /api/complaints/  { scan_id, reason, details }  a user disputes a verdict
    GET  /api/complaints/  admins see every complaint, users see their own
    """
    from detector.models import Complaint
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not request.user.is_authenticated:
        return _json({'error': 'Please log in first.'}, status=401)

    if request.method == 'GET':
        qs = Complaint.objects.select_related('reporter')
        if not is_admin(request.user):
            qs = qs.filter(reporter=request.user)
        return _json({'complaints': [_complaint_json(c) for c in qs[:200]]})

    if request.method != 'POST':
        return _json({'error': 'GET or POST required'}, status=405)
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return _json({'error': 'Invalid JSON'}, status=400)

    reason  = str(body.get('reason', '')).strip()[:200]
    details = str(body.get('details', '')).strip()[:5000]
    if not reason:
        return _json({'error': 'Please give a reason.'}, status=400)
    try:
        scan = ScanResult.objects.get(id=int(body.get('scan_id')))
    except (ScanResult.DoesNotExist, TypeError, ValueError):
        return _json({'error': 'Scan not found'}, status=404)
    if not can_view_scan(request.user, scan):
        return _json({'error': 'You can only complain about your own scans.'}, status=403)
    if Complaint.objects.filter(scan=scan, reporter=request.user, status='pending').exists():
        return _json({'error': 'You already have an open complaint about this scan.'}, status=400)

    c = Complaint.objects.create(scan=scan, reporter=request.user, reason=reason, details=details)
    return _json({'ok': True, 'complaint': _complaint_json(c)})


@csrf_exempt
def api_complaint_action(request, complaint_id):
    """POST /api/complaints/<id>/action/  { action: 'resolved' | 'dismissed' }  admins only"""
    from detector.models import Complaint
    if request.method == 'OPTIONS':
        return cors_preflight(request)
    if not is_admin(request.user):
        return _json({'error': 'Admin access required'}, status=403)
    if request.method != 'POST':
        return _json({'error': 'POST required'}, status=405)
    try:
        action = json.loads(request.body).get('action')
    except (json.JSONDecodeError, AttributeError):
        return _json({'error': 'Invalid JSON'}, status=400)
    if action not in ('resolved', 'dismissed'):
        return _json({'error': "action must be 'resolved' or 'dismissed'"}, status=400)
    c = get_object_or_404(Complaint, id=complaint_id)
    c.status = action
    c.save(update_fields=['status'])
    return _json({'ok': True, 'status': c.status})
