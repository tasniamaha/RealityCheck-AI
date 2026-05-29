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


def is_expert(user):
    return user.is_authenticated and (
        user.groups.filter(name='Experts').exists() or user.is_staff
    )


def is_admin(user):
    return user.is_authenticated and user.is_staff


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
        return _json({
            'status':              'REVIEWED',  # Mark as already reviewed
            'scan_id':             existing_scan.id,
            'file_name':           filename,
            'media_type':          existing_scan.media_type,
            'is_cached_result':    True,
            'original_scan_id':    existing_scan.id,
            'message':             'This file has been analyzed before. Using cached result.',
            'model_results':       [
                {'model_name': 'SigLIP (HuggingFace)', 'fake_prob': existing_scan.siglip_prob, 'real_prob': round(100 - existing_scan.siglip_prob, 2) if existing_scan.siglip_prob else None, 'verdict': 'FAKE' if existing_scan.siglip_prob >= 50 else 'REAL' if existing_scan.siglip_prob < 35 else 'UNCERTAIN'},
                {'model_name': 'Xception-FaceForensics', 'fake_prob': existing_scan.xception_prob, 'real_prob': round(100 - existing_scan.xception_prob, 2) if existing_scan.xception_prob else None, 'verdict': 'FAKE' if existing_scan.xception_prob >= 50 else 'REAL' if existing_scan.xception_prob < 35 else 'UNCERTAIN'},
                {'model_name': 'EfficientNet-B0 (Custom)', 'fake_prob': existing_scan.efficientnet_prob, 'real_prob': round(100 - existing_scan.efficientnet_prob, 2) if existing_scan.efficientnet_prob else None, 'verdict': 'FAKE' if existing_scan.efficientnet_prob >= 50 else 'REAL' if existing_scan.efficientnet_prob < 35 else 'UNCERTAIN'},
            ],
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

    # Create new scan record with file hash
    scan = ScanResult(
        media_type             = result.get('media_type', 'image'),
        file_name              = filename,
        file_hash              = file_hash,  # Store hash for duplicate detection
        siglip_prob            = probs.get('SigLIP (HuggingFace)'),
        xception_prob          = probs.get('Xception-FaceForensics'),
        efficientnet_prob      = probs.get('EfficientNet-B0 (Custom)'),
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
    result['ensemble']['verdict'] = 'PENDING'

    return _json(result)


def scan_status(request, scan_id):
    """Get the current status of a scan, including expert verdict when ready."""
    scan = get_object_or_404(ScanResult, id=scan_id)
    
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
@csrf_exempt
@require_POST
def api_model_voice(request):
    """
    Proxies a voice-generation request to the Anthropic API.
    The image is loaded from disk via scan_id — no base64 in the request body,
    which previously caused "Unexpected end of JSON input" on large files.

    Accepts JSON (small, metadata-only):
        { scan_id, model_name, short_name, verdict, fake_prob,
          fake_signals, real_signals, specialty, other_models }
    Returns JSON: { voice: "..." }
    """
    # ── 1. Parse the (small, metadata-only) request body ──────────────────────
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        return _json({'error': f'Invalid JSON body: {exc}'}, status=400)

    scan_id      = body.get('scan_id')
    model_name   = body.get('model_name', 'Unknown Model')
    short_name   = body.get('short_name', model_name)
    verdict      = body.get('verdict', 'UNCERTAIN')
    fake_prob    = body.get('fake_prob')
    fake_signals = body.get('fake_signals', [])
    real_signals = body.get('real_signals', [])
    specialty    = body.get('specialty', 'image authenticity')
    other_models = body.get('other_models', '')

    fake_prob_str = f"{float(fake_prob):.1f}" if fake_prob is not None else "unknown"

    # ── 2. Load the image from disk (backend already has it) ──────────────────
    image_b64 = None
    if scan_id:
        try:
            scan = ScanResult.objects.get(id=scan_id)
            if scan.media_file and scan.media_type == 'image':
                import base64, io
                scan.media_file.open('rb')
                raw = scan.media_file.read()
                scan.media_file.close()

                # Resize to max 1024px on longest side to keep payload reasonable
                img = Image.open(io.BytesIO(raw)).convert('RGB')
                img.thumbnail((1024, 1024), Image.LANCZOS)
                buf = io.BytesIO()
                img.save(buf, format='JPEG', quality=75)
                image_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        except Exception:
            image_b64 = None  # proceed without image — text-only prompt still works

    # ── 3. Build the prompt ───────────────────────────────────────────────────
    if verdict == 'FAKE':
        verdict_instruction = (
            f"3. Be specific about what is WRONG in this image: describe the exact visual "
            f"problems you found — such as {', '.join(fake_signals[:2])}. "
            f"Explain WHY these are signs of manipulation (e.g. real lighting casts coherent shadows, "
            f"real cameras produce natural noise, real faces have consistent texture gradients)."
        )
    elif verdict == 'REAL':
        verdict_instruction = (
            f"3. Be specific about what makes this image authentic: describe the signals that "
            f"confirm it — such as {', '.join(real_signals[:2])}. "
            f"Explain WHY these prove authenticity (e.g. natural noise patterns, coherent depth-of-field, "
            f"physically plausible lighting falloff)."
        )
    else:
        verdict_instruction = (
            "3. Explain the conflicting signals: what looks authentic AND what looks suspicious. "
            "Name the specific visual or statistical tension that made you uncertain."
        )

    prompt = (
        f"You are {short_name}, an AI deepfake detection model specializing in {specialty}.\n\n"
        f"You just analyzed this image. Your output: verdict={verdict}, fake_probability={fake_prob_str}%.\n\n"
        f"Speak in FIRST PERSON as the model itself. Be direct, forensic, and technically specific. "
        f"Your tone is a confident expert reporting findings — not hedging, not generic.\n\n"
        f"Write exactly 3 sentences:\n"
        f"1. What specific visual or statistical signals you detected in THIS image "
        f"(name concrete things: lighting direction, texture frequency, edge sharpness, shadow consistency, "
        f"color histogram anomalies, semantic plausibility of the scene, pixel noise pattern, etc.).\n"
        f"2. How these signals connect to your verdict — why they indicate "
        f"{'manipulation/generation' if verdict == 'FAKE' else 'authenticity' if verdict == 'REAL' else 'ambiguity'}.\n"
        f"{verdict_instruction}\n\n"
        f"Other models scored: {other_models}. In your third sentence, briefly say whether you agree "
        f"or disagree and why.\n\n"
        f"RULES: No bullet points. No preamble like 'I analyzed...' — start with your finding. "
        f"Be blunt. Name real visual phenomena you see. Never say 'I cannot see the image'."
    )

    # ── 4. Build Anthropic message (attach image only if we got one) ──────────
    user_content = []
    if image_b64:
        user_content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": "image/jpeg", "data": image_b64}
        })
    user_content.append({"type": "text", "text": prompt})

    anthropic_payload = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 300,
        "messages": [{"role": "user", "content": user_content}]
    }).encode("utf-8")

    # ── 5. Call Anthropic (or fall back to deterministic voice) ───────────────
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")

    if not api_key:
        # Deterministic fallback — still returns a real, specific sentence
        sig0 = fake_signals[0] if fake_signals else 'statistical anomalies'
        sig1 = fake_signals[1] if len(fake_signals) > 1 else 'inconsistent pixel patterns'
        rs0  = real_signals[0] if real_signals else 'natural signal distribution'
        rs1  = real_signals[1] if len(real_signals) > 1 else 'consistent pixel statistics'
        agree = 'agrees' if verdict in other_models else 'differs — but my signal confidence is high'
        other_first = other_models.split(',')[0].strip() if other_models else 'peer models'

        if verdict == 'FAKE':
            voice = (
                f"My {specialty} pipeline flagged this image based on {sig0} and {sig1}, "
                f"both of which are characteristic fingerprints of synthetically generated or manipulated media. "
                f"At {fake_prob_str}% fake probability this is a clear positive — {other_first} {agree}."
            )
        elif verdict == 'REAL':
            voice = (
                f"Across my {specialty} analysis, this image exhibits {rs0} and {rs1}, "
                f"both consistent with genuine camera capture rather than neural generation. "
                f"A {fake_prob_str}% fake probability confirms authenticity — {other_first} {agree}."
            )
        else:
            voice = (
                f"My {specialty} detects competing signals: {sig0} points toward manipulation, "
                f"while {rs0} aligns with authentic capture, creating genuine ambiguity. "
                f"At {fake_prob_str}% I cannot commit — expert human review is the correct next step."
            )
        return _json({"voice": voice})

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=anthropic_payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
        voice = "".join(
            block["text"]
            for block in resp_data.get("content", [])
            if block.get("type") == "text"
        )
        return _json({"voice": voice.strip() or "Analysis complete."})
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="replace")
        return _json({"error": f"Anthropic API error {exc.code}: {err_body}"}, status=502)
    except Exception as exc:
        return _json({"error": str(exc)}, status=502)