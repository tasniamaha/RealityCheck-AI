"""
image_detector.py
------------------
Runs every enabled model on a PIL image.
Returns per-model results + ensemble average.

Xception is a face-forensics model: it only scores a cropped face. If no face
is found it is skipped (fake_prob = None) and left out of the ensemble.
"""

import os
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from typing import Dict, Any, List, Optional

from detector import model_registry as registry

DEVICE = registry.DEVICE

SIGLIP_NAME       = 'SigLIP (HuggingFace)'
XCEPTION_NAME     = 'Xception-FaceForensics'
EFFICIENTNET_NAME = 'EfficientNet-B0 (Custom)'

# Xception preprocessing (only used when model_registry.XCEPTION_ENABLED is True).
XCEPTION_INPUT_SIZE = 150
XCEPTION_MEAN       = [0.485, 0.456, 0.406]
XCEPTION_STD        = [0.229, 0.224, 0.225]
FACE_MARGIN         = 0.30   # extra border around the detected face


def make_xception_transform(size=None, mean=None, std=None):
    size = size or XCEPTION_INPUT_SIZE
    return transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(mean or XCEPTION_MEAN, std or XCEPTION_STD),
    ])


XCEPTION_TRANSFORM = make_xception_transform()

EFFICIENTNET_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


# Label bands for a 0-100 fake score. Between the two the result is UNCERTAIN and waits for
# an expert. Provisional: set from a 17-image check where fakes often scored 20-50.
# Re-tune with `python manage.py evaluate testset` once the test set has 100+ files per class.
REAL_BELOW = 20
FAKE_FROM  = 50


def _verdict(fake_prob_pct: float) -> str:
    if fake_prob_pct >= FAKE_FROM:
        return 'FAKE'
    if fake_prob_pct < REAL_BELOW:
        return 'REAL'
    return 'UNCERTAIN'


def _result(name: str, fake_prob: float) -> Dict[str, Any]:
    """fake_prob is 0-1."""
    fake_pct = round(fake_prob * 100, 2)
    return {
        'model_name': name,
        'fake_prob':  fake_pct,
        'real_prob':  round(100 - fake_pct, 2),
        'verdict':    _verdict(fake_pct),
    }


def _unavailable(name: str, verdict: str, message: str) -> Dict[str, Any]:
    return {'model_name': name, 'fake_prob': None, 'real_prob': None,
            'verdict': verdict, 'error': message}


# -- Face detection --
#
# Primary detector: YuNet (OpenCV FaceDetectorYN). Put its model file in weights/, e.g.
# weights/face_detection_yunet_2023mar.onnx (from the opencv_zoo repository).
# If the file is missing, the old Haar cascade is used and a warning is printed once.

import glob
import threading

YUNET_SCORE_THRESHOLD = 0.6    # lower = finds more faces, but more false detections
YUNET_MAX_SIDE        = 640    # large images are shrunk to this before detection

_YUNET        = None
_YUNET_TRIED  = False
_FACE_CASCADE = None
_FACE_LOCK    = threading.Lock()


def _get_yunet():
    """Returns the YuNet detector, or None if its model file is not in weights/."""
    global _YUNET, _YUNET_TRIED
    if not _YUNET_TRIED:
        _YUNET_TRIED = True
        import cv2
        from django.conf import settings
        found = sorted(glob.glob(os.path.join(str(settings.BASE_DIR), 'weights',
                                              'face_detection_yunet*.onnx')))
        if found and hasattr(cv2, 'FaceDetectorYN'):
            _YUNET = cv2.FaceDetectorYN.create(found[-1], '', (320, 320),
                                               YUNET_SCORE_THRESHOLD, 0.3, 5000)
            print(f'[FaceDetector] Using YuNet: {os.path.basename(found[-1])}')
        else:
            print('[FaceDetector] WARNING: no weights/face_detection_yunet*.onnx found '
                  '- falling back to the Haar cascade, which misses many faces.')
    return _YUNET


def _get_face_cascade():
    global _FACE_CASCADE
    if _FACE_CASCADE is None:
        import cv2
        from django.conf import settings
        name = 'haarcascade_frontalface_default.xml'
        candidates = [
            os.path.join(str(settings.BASE_DIR), 'weights', name),
            os.path.join(getattr(getattr(cv2, 'data', None), 'haarcascades', ''), name),
        ]
        path = next((p for p in candidates if os.path.exists(p)), None)
        if path is None:
            raise FileNotFoundError(f'{name} not found. Put it in the weights/ folder.')
        _FACE_CASCADE = cv2.CascadeClassifier(path)
    return _FACE_CASCADE


def _largest_face_yunet(image: Image.Image, detector):
    import cv2
    import numpy as np

    bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    h, w = bgr.shape[:2]
    scale = min(1.0, YUNET_MAX_SIDE / max(h, w))
    if scale < 1.0:
        bgr = cv2.resize(bgr, (max(1, int(w * scale)), max(1, int(h * scale))))
    detector.setInputSize((bgr.shape[1], bgr.shape[0]))
    _, faces = detector.detect(bgr)
    if faces is None or len(faces) == 0:
        return None
    x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])[:4] / scale
    return int(x), int(y), int(fw), int(fh)


def _largest_face_haar(image: Image.Image):
    import cv2
    import numpy as np

    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    min_side = max(40, min(image.size) // 8)
    faces = _get_face_cascade().detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(min_side, min_side))
    if len(faces) == 0:
        return None
    return tuple(int(v) for v in max(faces, key=lambda f: f[2] * f[3]))


def crop_face(image: Image.Image, margin: float = FACE_MARGIN) -> Optional[Image.Image]:
    """Returns a square crop around the largest face, or None if there is no face."""
    with _FACE_LOCK:   # the detectors keep internal state, so one image at a time
        detector = _get_yunet()
        box = (_largest_face_yunet(image, detector) if detector is not None
               else _largest_face_haar(image))
    if box is None:
        return None

    x, y, w, h = box
    if w < 10 or h < 10:
        return None
    half = int(max(w, h) * (1 + 2 * margin) / 2)
    cx, cy = x + w // 2, y + h // 2
    crop_box = (max(0, cx - half), max(0, cy - half),
                min(image.width, cx + half), min(image.height, cy + half))
    return image.crop(crop_box)


# -- Per-model runners --

def run_siglip(image: Image.Image) -> Dict[str, Any]:
    if registry.SIGLIP_MODEL is None:
        return _unavailable(SIGLIP_NAME, 'ERROR', 'Model not loaded')

    inputs = registry.SIGLIP_PROCESSOR(images=image, return_tensors='pt').to(DEVICE)
    with torch.no_grad():
        logits = registry.SIGLIP_MODEL(**inputs).logits
    probs = F.softmax(logits, dim=1).squeeze().tolist()
    return _result(SIGLIP_NAME, probs[registry.SIGLIP_FAKE_INDEX])


def run_xception(image: Image.Image, transform=None) -> Dict[str, Any]:
    if registry.XCEPTION_MODEL is None:
        return _unavailable(XCEPTION_NAME, 'ERROR', 'Model not loaded')

    face = crop_face(image)
    if face is None:
        return _unavailable(XCEPTION_NAME, 'SKIPPED', 'No face detected')

    tensor = (transform or XCEPTION_TRANSFORM)(face).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        fake_prob = torch.sigmoid(registry.XCEPTION_MODEL(tensor)).item()
    return _result(XCEPTION_NAME, fake_prob)


def run_efficientnet(image: Image.Image) -> Dict[str, Any]:
    if registry.EFFICIENTNET_MODEL is None:
        return _unavailable(EFFICIENTNET_NAME, 'ERROR', 'Model not loaded')

    tensor = EFFICIENTNET_TRANSFORM(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        prob = torch.softmax(registry.EFFICIENTNET_MODEL(tensor), dim=1).squeeze().tolist()
    return _result(EFFICIENTNET_NAME, prob[1])   # index 1 = fake


# Xception only runs when model_registry.XCEPTION_ENABLED is True.
MODEL_RUNNERS = [(SIGLIP_NAME, run_siglip)]
if registry.XCEPTION_ENABLED:
    MODEL_RUNNERS.append((XCEPTION_NAME, run_xception))
MODEL_RUNNERS.append((EFFICIENTNET_NAME, run_efficientnet))


def run_all_models(image: Image.Image) -> List[Dict[str, Any]]:
    image = image.convert('RGB')
    results = []
    for name, runner in MODEL_RUNNERS:
        try:
            results.append(runner(image))
        except Exception as e:
            results.append(_unavailable(name, 'ERROR', str(e)))
    return results


def compute_ensemble(results: List[Dict]) -> Dict[str, Any]:
    valid = [r for r in results if r.get('fake_prob') is not None]
    if not valid:
        return {'model_name': 'Ensemble (Average)', 'verdict': 'ERROR',
                'fake_prob': None, 'real_prob': None, 'models_used': 0}
    avg = round(sum(r['fake_prob'] for r in valid) / len(valid), 2)
    return {
        'model_name':  'Ensemble (Average)',
        'fake_prob':   avg,
        'real_prob':   round(100 - avg, 2),
        'verdict':     _verdict(avg),
        'models_used': len(valid),
    }


def analyze_image(image: Image.Image, filename=None) -> Dict[str, Any]:
    model_results = run_all_models(image)
    return {
        'media_type':    'image',
        'model_results': model_results,
        'ensemble':      compute_ensemble(model_results),
    }