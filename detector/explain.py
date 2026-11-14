"""
explain.py
-----------
Honest per-model explanations for a scan.

Nothing here is written by a language model. The text is built only from the
scores stored for the scan, and the heatmap is a Grad-CAM style attribution
computed from the detector itself: it shows which regions moved that model's
score, not why.
"""

import base64
import io
import json
import threading

import numpy as np
import torch
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image

from detector import image_detector as det
from detector import model_registry as registry
from detector.models import ScanResult

_LOCK = threading.Lock()   # the models are shared; hooks and gradients must not interleave

SHORT = {
    det.SIGLIP_NAME:       'SigLIP',
    det.XCEPTION_NAME:     'Xception',
    det.EFFICIENTNET_NAME: 'EfficientNet-B0',
}
SCORE_FIELD = {
    det.SIGLIP_NAME:       'siglip_prob',
    det.XCEPTION_NAME:     'xception_prob',
    det.EFFICIENTNET_NAME: 'efficientnet_prob',
}


# -- Attribution maps --

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


def _cam_siglip(image, explain_fake):
    """Gradient x activation on the final patch tokens, reshaped to the patch grid."""
    model, processor = registry.SIGLIP_MODEL, registry.SIGLIP_PROCESSOR
    if model is None:
        return None
    fake = registry.SIGLIP_FAKE_INDEX
    with torch.enable_grad():
        inputs = processor(images=image, return_tensors='pt').to(det.DEVICE)
        out = model(**inputs, output_hidden_states=True)
        tokens = out.hidden_states[-1]                      # [1, patches, dim]
        target = fake if explain_fake else 1 - fake
        grad = torch.autograd.grad(out.logits[0, target], tokens)[0]
    cam = torch.relu((grad * tokens).sum(dim=-1))[0]
    side = int(round(cam.numel() ** 0.5))
    if side * side != cam.numel():
        return None
    return cam.reshape(side, side).detach().cpu().numpy()


CAM_BUILDERS = {
    det.SIGLIP_NAME:       _cam_siglip,
    det.EFFICIENTNET_NAME: _cam_efficientnet,
}


def _overlay(image, cam):
    """Blend the map over the image. Returns a JPEG data URL, or None if the map is empty."""
    import cv2
    img = image.copy()
    img.thumbnail((512, 512))
    arr = np.asarray(img).astype('float32')

    cam = cam.astype('float32')
    cam -= cam.min()
    if not np.isfinite(cam).all() or cam.max() <= 0:
        return None
    cam /= cam.max()
    cam = cv2.resize(cam, (arr.shape[1], arr.shape[0]), interpolation=cv2.INTER_CUBIC)
    cam = np.clip(cam, 0, 1)

    heat = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)[:, :, ::-1].astype('float32')
    alpha = (0.6 * cam)[..., None]
    blended = np.uint8(arr * (1 - alpha) + heat * alpha)

    buf = io.BytesIO()
    Image.fromarray(blended).save(buf, format='JPEG', quality=85)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


def build_heatmap(scan, model_name, explain_fake):
    """Returns a data URL or None. Never raises: a missing heatmap must not break the page."""
    builder = CAM_BUILDERS.get(model_name)
    if builder is None or scan.media_type != 'image' or not scan.media_file:
        return None
    try:
        with scan.media_file.open('rb') as fh:
            image = Image.open(io.BytesIO(fh.read())).convert('RGB')
        with _LOCK:
            cam = builder(image, explain_fake)
        return None if cam is None else _overlay(image, cam)
    except Exception as e:
        print(f'[explain] heatmap failed for {model_name}: {e}')
        return None


# -- Text --

def build_text(scan, model_name, has_heatmap):
    short = SHORT[model_name]
    prob = getattr(scan, SCORE_FIELD[model_name])
    if prob is None:
        return f'{short} did not score this {scan.media_type}, so it was left out of the result.'

    side = 'fake' if prob >= 50 else 'real'
    parts = [f'{short} scored this {scan.media_type} {prob:.1f}% likely fake '
             f'(label: {det._verdict(prob)}).']
    if has_heatmap:
        parts.append(f'The heatmap marks the areas that pushed its score toward {side}. '
                     f'It shows where the model looked, not why.')
    elif scan.media_type != 'image':
        parts.append('Heatmaps are only available for images.')
    parts.append('This model outputs a score only, so no reasons are generated for it.')

    enabled = {name for name, _ in det.MODEL_RUNNERS}
    for other_name, field in SCORE_FIELD.items():
        other = getattr(scan, field)
        if other_name == model_name or other is None or other_name not in enabled:
            continue
        if (other >= 50) == (prob >= 50):
            parts.append(f'{SHORT[other_name]} agrees ({other:.1f}%).')
        else:
            parts.append(f'{SHORT[other_name]} scored it {other:.1f}%, so the models disagree: '
                         f'treat this as low confidence until an expert reviews it.')
    return ' '.join(parts)


# -- Endpoint --

@csrf_exempt
def api_model_voice(request):
    """
    POST /api/model-voice/  { scan_id, model_name }
    Returns { voice, heatmap, model_name, fake_prob }.
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

    prob = getattr(scan, SCORE_FIELD[model_name])
    heatmap = build_heatmap(scan, model_name, prob >= 50) if prob is not None else None
    return JsonResponse({
        'model_name': model_name,
        'fake_prob':  prob,
        'voice':      build_text(scan, model_name, heatmap is not None),
        'heatmap':    heatmap,
    })
