"""
explain.py
-----------
Plain-language explanations for each model's opinion on a scan.

Nothing here is written by a language model, and nothing is made up. Each
explanation is built from facts we can check:
  1. the model's own score (how sure it is, and which way),
  2. what the model was trained on (so a reader knows what it looks for),
  3. a heatmap of the areas that pushed its score, and a description of where
     those areas are (face edges, eyes, mouth, background ...),
  4. whether the other models agree,
  5. how often this model was right on our labelled test set, and its known
     weak spots.

The heatmap shows WHERE the model's decision came from, not WHY in human terms;
the text says so.
"""

import base64
import io
import json
import threading

import numpy as np
import torch
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image, ImageFilter

from detector import image_detector as det
from detector import model_registry as registry
from detector.models import ScanResult

_LOCK = threading.Lock()   # the models are shared; hooks and gradients must not interleave

SCORE_FIELD = det.SCORE_FIELDS

# What each model is, in plain words, and how it did on our 221-image test set
# (python manage.py evaluate testset). Update the numbers after re-running it.
MODEL_INFO = {
    det.SIGLIP_NAME: {
        'short': 'SigLIP',
        'learned': 'It learned from thousands of photos labelled "real" or "deepfake" and judges the '
                   'whole picture at once.',
        'accuracy': 52.0,
        'weak': 'On our test set it was close to guessing, so do not rely on it alone.',
    },
    det.XCEPTION_NAME: {
        'short': 'Xception',
        'learned': 'It looks only at the face. It was trained on face-swap videos, where a pasted-in '
                   'face often leaves blending seams, blur or a skin-tone change around its edges.',
        'accuracy': 55.7,
        'weak': 'It only scores pictures with a clear face, and it rarely calls anything fake '
                'unless it looks like a face swap.',
    },
    det.EFFICIENTNET_NAME: {
        'short': 'EfficientNet',
        'learned': 'This is our own model. We trained it on about 3,000 pictures: real photos of '
                   'people next to fakes made with Stable Diffusion and face-swap tools.',
        'accuracy': 60.2,
        'weak': 'It often calls ordinary phone photos fake (8 of our 10 real test photos).',
    },
    det.AIHUMAN_NAME: {
        'short': 'AI-vs-Human',
        'learned': 'It compares the picture with what it learned from 60,000 AI-generated and '
                   '60,000 human-made images.',
        'accuracy': 64.3,
        'weak': 'It often calls ordinary phone photos AI-made (8 of our 10 real test photos).',
    },
    det.EXPERT_NAME: {
        'short': 'Expert-trained',
        'learned': 'It was trained on pictures that our experts reviewed, using the reasons they '
                   'gave for calling something fake.',
        'accuracy': None,
        'weak': 'It only knows the kinds of fakes our experts have already seen many times.',
    },
}
if hasattr(det, 'OPENFAKE_NAME'):
    MODEL_INFO[det.OPENFAKE_NAME] = {
        'short': 'OpenFake',
        'learned': 'It was trained on a large collection of pictures from recent AI image '
                   'generators, next to real photos.',
        'accuracy': 75.6,
        'weak': 'It is the best of our models at fully AI-made pictures, but it almost never '
                'spots face swaps (1 of 33 in our test).',
    }

SHORT = {name: info['short'] for name, info in MODEL_INFO.items()}


# -- How sure the model is -------------------------------------------------------

def strength(prob):
    """Plain words for a 0-100 fake score. Matches the app's labels (FAKE from 50, REAL below 20)."""
    if prob >= 85:
        return 'fake', 'is very sure this is fake'
    if prob >= 65:
        return 'fake', 'is fairly sure this is fake'
    if prob >= det.FAKE_FROM:
        return 'fake', 'leans towards fake, but only a little'
    if prob >= det.REAL_BELOW:
        return 'real', 'cannot decide; it leans slightly towards real'
    if prob >= 10:
        return 'real', 'is fairly sure this is real'
    return 'real', 'is very sure this is real'


# -- Where is the face? ----------------------------------------------------------

def face_box(image):
    """(x, y, w, h) of the largest face, using the same detector the app uses. None if no face."""
    try:
        lock = getattr(det, '_FACE_LOCK', None)
        if hasattr(det, '_get_yunet') and lock is not None:
            with lock:
                yunet = det._get_yunet()
                box = (det._largest_face_yunet(image, yunet) if yunet is not None
                       else det._largest_face_haar(image))
            return box
        import cv2
        cascade = det._get_face_cascade()
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        side = max(30, min(image.size) // 10)
        faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(side, side))
        if len(faces) == 0:
            return None
        return tuple(int(v) for v in max(faces, key=lambda f: f[2] * f[3]))
    except Exception as e:
        print(f'[explain] face detection failed: {e}')
        return None


def crop_box(image, box, margin=None):
    """The square around the face that crop_face() gives the Xception model."""
    margin = det.FACE_MARGIN if margin is None else margin
    x, y, w, h = box
    half = int(max(w, h) * (1 + 2 * margin) / 2)
    cx, cy = x + w // 2, y + h // 2
    return (max(0, cx - half), max(0, cy - half),
            min(image.width, cx + half), min(image.height, cy + half))


# -- Attribution maps --------------------------------------------------------------
# Each builder returns a 2-D array: high values mark areas that pushed the score
# towards the side we are explaining (fake or real).

def _cam_efficientnet(image, explain_fake):
    """Grad-CAM on the last convolutional block."""
    model = registry.EFFICIENTNET_MODEL
    if model is None:
        return None
    store = {}
    hook = model.features[-1].register_forward_hook(
        lambda _m, _i, out: store.__setitem__('act', out))
    try:
        with torch.enable_grad():
            x = det.EFFICIENTNET_TRANSFORM(image).unsqueeze(0).to(det.DEVICE)
            logits = model(x)
            act = store['act']
            grad = torch.autograd.grad(logits[0, 1 if explain_fake else 0], act)[0]
    finally:
        hook.remove()
    weights = grad.mean(dim=(2, 3), keepdim=True)
    cam = torch.relu((weights * act).sum(dim=1))[0]
    return cam.detach().cpu().numpy()


def _cam_hf(model, processor, fake, image, explain_fake):
    """Gradient x activation on the final patch tokens (SigLIP-style models)."""
    if model is None:
        return None
    with torch.enable_grad():
        inputs = processor(images=image, return_tensors='pt').to(det.DEVICE)
        out = model(**inputs, output_hidden_states=True)
        tokens = out.hidden_states[-1]
        if tokens.dim() != 3:
            return None
        target = fake if explain_fake else 1 - fake
        grad = torch.autograd.grad(out.logits[0, target], tokens)[0]
    cam = torch.relu((grad * tokens).sum(dim=-1))[0]
    side = int(round(cam.numel() ** 0.5))
    if side * side != cam.numel():
        return None
    return cam.reshape(side, side).detach().cpu().numpy()


def _occlusion(image, score_batch, explain_fake, grid=6):
    """
    Model-agnostic map: blur one tile at a time and see how much the fake score
    changes. A tile whose blurring lowers the fake score was pushing towards fake.
    score_batch: list of PIL images -> list of fake probabilities (0-1).
    """
    blurred = image.filter(ImageFilter.GaussianBlur(radius=max(4, min(image.size) // 25)))
    w, h = image.size
    tiles, images = [], [image]
    for gy in range(grid):
        for gx in range(grid):
            box = (gx * w // grid, gy * h // grid, (gx + 1) * w // grid, (gy + 1) * h // grid)
            masked = image.copy()
            masked.paste(blurred.crop(box), box[:2])
            tiles.append((gy, gx))
            images.append(masked)
    scores = score_batch(images)
    base, rest = scores[0], scores[1:]
    cam = np.zeros((grid, grid), dtype='float32')
    for (gy, gx), s in zip(tiles, rest):
        cam[gy, gx] = (base - s) if explain_fake else (s - base)
    return np.clip(cam, 0, None)


def _hf_batch(model, processor, fake):
    def score(images):
        with torch.no_grad():
            inputs = processor(images=images, return_tensors='pt').to(det.DEVICE)
            probs = torch.softmax(model(**inputs).logits, dim=1)[:, fake]
        return probs.cpu().tolist()
    return score


def _cam_siglip(image, explain_fake):
    return _cam_hf(registry.SIGLIP_MODEL, registry.SIGLIP_PROCESSOR,
                   registry.SIGLIP_FAKE_INDEX, image, explain_fake)


def _cam_aihuman(image, explain_fake):
    return _cam_hf(registry.AIHUMAN_MODEL, registry.AIHUMAN_PROCESSOR,
                   registry.AIHUMAN_FAKE_INDEX, image, explain_fake)


def _cam_openfake(image, explain_fake):
    model = getattr(registry, 'OPENFAKE_MODEL', None)
    if model is None:
        return None
    small = image.copy()
    small.thumbnail((512, 512))
    return _occlusion(small, _hf_batch(model, registry.OPENFAKE_PROCESSOR,
                                       registry.OPENFAKE_FAKE_INDEX), explain_fake)


def _cam_xception(image, explain_fake):
    """Occlusion on the face crop the model sees, placed back into a full-size map."""
    model = registry.XCEPTION_MODEL
    box = face_box(image)
    if model is None or box is None:
        return None
    cb = crop_box(image, box)
    face = image.crop(cb)

    def score(images):
        x = torch.stack([det.XCEPTION_TRANSFORM(im) for im in images]).to(det.DEVICE)
        with torch.no_grad():
            return torch.sigmoid(model(x)).flatten().cpu().tolist()

    small = _occlusion(face, score, explain_fake)
    full = np.zeros((image.height, image.width), dtype='float32')
    full[cb[1]:cb[3], cb[0]:cb[2]] = _resize(small, cb[2] - cb[0], cb[3] - cb[1])
    return full


CAM_BUILDERS = {
    det.SIGLIP_NAME:       _cam_siglip,
    det.XCEPTION_NAME:     _cam_xception,
    det.EFFICIENTNET_NAME: _cam_efficientnet,
    det.AIHUMAN_NAME:      _cam_aihuman,
}
if hasattr(det, 'OPENFAKE_NAME'):
    CAM_BUILDERS[det.OPENFAKE_NAME] = _cam_openfake


def _resize(cam, width, height, smooth=True):
    import cv2
    interp = cv2.INTER_CUBIC if smooth else cv2.INTER_NEAREST
    return cv2.resize(cam.astype('float32'), (max(1, width), max(1, height)), interpolation=interp)


def _normalise(cam):
    cam = np.nan_to_num(cam.astype('float32'))
    cam -= cam.min()
    if cam.max() <= 0:
        return None
    return cam / cam.max()


def _overlay(image, cam):
    """Blend the map over the image. Returns a JPEG data URL."""
    import cv2
    img = image.copy()
    img.thumbnail((512, 512))
    arr = np.asarray(img).astype('float32')
    cam = np.clip(_resize(cam, arr.shape[1], arr.shape[0]), 0, 1)
    heat = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)[:, :, ::-1].astype('float32')
    alpha = (0.6 * cam)[..., None]
    blended = np.uint8(arr * (1 - alpha) + heat * alpha)
    buf = io.BytesIO()
    Image.fromarray(blended).save(buf, format='JPEG', quality=85)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


# -- Where did the score come from? ----------------------------------------------

GRID_NAMES = [['top-left', 'top', 'top-right'],
              ['left side', 'centre', 'right side'],
              ['bottom-left', 'bottom', 'bottom-right']]


def describe_regions(image, cam, box, side):
    """One plain sentence about where the strongest areas of the map are."""
    scale = 256 / max(image.size)
    W, H = max(1, int(image.width * scale)), max(1, int(image.height * scale))
    m = np.clip(_resize(cam, W, H), 0, None)
    m = np.where(m >= np.quantile(m, 0.80), m, 0)          # keep the strongest 20%
    total = float(m.sum())
    if total <= 0:
        return None

    def share(x0, y0, x1, y1):
        x0, y0 = max(0, int(x0)), max(0, int(y0))
        x1, y1 = min(W, int(x1)), min(H, int(y1))
        return float(m[y0:y1, x0:x1].sum()) / total if x1 > x0 and y1 > y0 else 0.0

    if box is not None:
        x, y, w, h = (v * scale for v in box)
        on_face = share(x - 0.15 * w, y - 0.15 * h, x + 1.15 * w, y + 1.15 * h)
        centre = share(x + 0.2 * w, y + 0.2 * h, x + 0.8 * w, y + 0.8 * h)
        edges = on_face - centre
        upper = share(x, y, x + w, y + 0.5 * h)
        lower = share(x, y + 0.5 * h, x + w, y + h)
        if on_face >= 0.55:
            if edges >= 0.55 * on_face:
                where = 'the edges of the face (hairline, cheeks and jaw)'
                if side == 'fake':
                    where += ', which is where a swapped or edited face is blended in'
            elif upper >= 1.5 * lower:
                where = 'the upper half of the face: the eyes, eyebrows and forehead'
            elif lower >= 1.5 * upper:
                where = 'the lower half of the face: the nose, mouth and chin'
            else:
                where = 'the face itself'
        elif on_face <= 0.25:
            where = 'the background and surroundings, not the face'
        else:
            where = 'both the face and the background around it'
        return where

    cells = np.array([[share(gx * W / 3, gy * H / 3, (gx + 1) * W / 3, (gy + 1) * H / 3)
                       for gx in range(3)] for gy in range(3)])
    gy, gx = np.unravel_index(cells.argmax(), cells.shape)
    if cells.max() < 0.25:
        return 'spread across the whole picture rather than one spot'
    return f'the {GRID_NAMES[gy][gx]} of the picture'


def build_heatmap(scan, model_name, explain_fake):
    """Returns (data_url, region_sentence). Never raises: a missing heatmap must not break the page."""
    builder = CAM_BUILDERS.get(model_name)
    if builder is None or scan.media_type != 'image' or not scan.media_file:
        return None, None
    try:
        with scan.media_file.open('rb') as fh:
            image = Image.open(io.BytesIO(fh.read())).convert('RGB')
        with _LOCK:
            cam = builder(image, explain_fake)
        cam = None if cam is None else _normalise(cam)
        if cam is None:
            return None, None
        side = 'fake' if explain_fake else 'real'
        return _overlay(image, cam), describe_regions(image, cam, face_box(image), side)
    except Exception as e:
        print(f'[explain] heatmap failed for {model_name}: {e}')
        return None, None


# -- The explanation ---------------------------------------------------------------

def build_explanation(scan, model_name, region=None, has_heatmap=False):
    info = MODEL_INFO.get(model_name, {'short': model_name, 'learned': '', 'accuracy': None, 'weak': ''})
    short = info['short']
    prob = getattr(scan, SCORE_FIELD[model_name])
    if prob is None:
        reason = ('it only checks faces and could not find a clear one'
                  if model_name == det.XCEPTION_NAME else 'it could not score this file')
        return {
            'headline': f'{short} gave no opinion: {reason}.',
            'reasons': [],
            'heatmap_caption': None,
            'reliability': info['weak'],
        }

    side, sure = strength(prob)
    headline = f'{short} {sure} ({prob:.0f}% fake).'
    reasons = []

    if info['learned']:
        reasons.append(info['learned'])

    if model_name == det.EXPERT_NAME:
        meta = (registry.EXPERT_HEAD or {}).get('meta', {})
        found = '; '.join(meta.get('reasons', []))
        if found:
            reasons.append(f'The fake reasons it learned from experts: {found}.')

    if region:
        reasons.append(f'What pushed it towards {side} was mostly {region}.')
    elif has_heatmap:
        reasons.append(f'The heatmap marks the areas that pushed it towards {side}.')

    enabled = {name for name, _ in det.active_runners()}
    mine = det._verdict(prob)
    agree, unsure, disagree = [], [], []
    for other_name, field in SCORE_FIELD.items():
        other = getattr(scan, field, None)
        if other_name == model_name or other is None or other_name not in enabled:
            continue
        theirs = det._verdict(other)
        item = f'{SHORT.get(other_name, other_name)} {other:.0f}%'
        if theirs == mine:
            agree.append(item)
        elif 'UNCERTAIN' in (theirs, mine):
            unsure.append(item)
        else:
            disagree.append(item)
    parts = []
    if agree:
        parts.append(f'agree: {", ".join(agree)}')
    if unsure:
        parts.append(f'undecided: {", ".join(unsure)}')
    if disagree:
        parts.append(f'say the opposite: {", ".join(disagree)}')
    if parts:
        reasons.append('Other models (labels: FAKE from 50%, REAL below 20%, UNCERTAIN in between) - '
                       + '; '.join(parts) + '.')
    if disagree:
        reasons.append('Because some models say the opposite, treat this opinion with care.')

    reliability = []
    if info['accuracy'] is not None:
        reliability.append(f'On our 221-picture test set (mostly DeepFakeFace images, plus 21 of our own) '
                           f'it was right {info["accuracy"]:.0f}% of the time. Other kinds of images can give different results.')
    if info['weak']:
        reliability.append(info['weak'])

    caption = None
    if has_heatmap:
        caption = (f'Red and yellow mark the areas that pushed {short} towards {side}; blue areas '
                   f'mattered little. It shows where the model looked, not a proof of editing.')

    return {
        'headline': headline,
        'reasons': reasons,
        'heatmap_caption': caption,
        'reliability': ' '.join(reliability),
    }


def build_text(scan, model_name, has_heatmap):
    """One paragraph version (kept for older callers)."""
    e = build_explanation(scan, model_name, has_heatmap=has_heatmap)
    return ' '.join([e['headline']] + e['reasons'] + ([e['reliability']] if e['reliability'] else []))


# -- Endpoint ----------------------------------------------------------------------

@csrf_exempt
def api_model_voice(request):
    """
    POST /api/model-voice/  { scan_id, model_name }
    Returns { headline, reasons, heatmap, heatmap_caption, reliability, voice, model_name, fake_prob }.
    Scores are read from the database, never from the request.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        body = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    model_name = body.get('model_name')
    if model_name not in SCORE_FIELD:
        return JsonResponse({'error': 'Unknown model'}, status=400)
    try:
        scan = ScanResult.objects.get(id=int(body.get('scan_id')))
    except (ScanResult.DoesNotExist, TypeError, ValueError):
        return JsonResponse({'error': 'Scan not found'}, status=404)
    from detector.views import can_view_scan
    if not can_view_scan(request.user, scan):
        return JsonResponse({'error': 'You cannot view this scan.'}, status=403)

    prob = getattr(scan, SCORE_FIELD[model_name])
    heatmap, region = (build_heatmap(scan, model_name, prob >= 50) if prob is not None else (None, None))
    e = build_explanation(scan, model_name, region=region, has_heatmap=heatmap is not None)
    voice = ' '.join([e['headline']] + e['reasons'] + ([e['reliability']] if e['reliability'] else []))
    return JsonResponse({
        'model_name':      model_name,
        'fake_prob':       prob,
        'headline':        e['headline'],
        'reasons':         e['reasons'],
        'heatmap':         heatmap,
        'heatmap_caption': e['heatmap_caption'],
        'reliability':     e['reliability'],
        'voice':           voice,
    })
