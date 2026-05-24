"""
image_detector.py
------------------
Runs all 3 models on a PIL image.
Returns per-model results + ensemble average.
"""

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from typing import Dict, Any, List

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

XCEPTION_TRANSFORM = transforms.Compose([
    transforms.Resize((299, 299)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])

EFFICIENTNET_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


def _verdict(fake_prob_pct: float) -> str:
    if fake_prob_pct >= 50:
        return 'FAKE'
    elif fake_prob_pct >= 35:
        return 'UNCERTAIN'
    return 'REAL'


def run_siglip(image: Image.Image) -> Dict[str, Any]:
    from detector.model_registry import SIGLIP_MODEL, SIGLIP_PROCESSOR
    if SIGLIP_MODEL is None:
        return {'model_name': 'SigLIP (HuggingFace)', 'error': 'Model not loaded', 'verdict': 'ERROR', 'fake_prob': None}

    inputs = SIGLIP_PROCESSOR(images=image, return_tensors='pt')
    with torch.no_grad():
        logits = SIGLIP_MODEL(**inputs).logits
    probs = F.softmax(logits, dim=1).squeeze().tolist()
    # id2label: {0: "fake", 1: "real"}
    fake_pct = round(probs[0] * 100, 2)
    real_pct = round(probs[1] * 100, 2)
    return {
        'model_name': 'SigLIP (HuggingFace)',
        'fake_prob':  fake_pct,
        'real_prob':  real_pct,
        'verdict':    _verdict(fake_pct),
    }


def run_xception(image: Image.Image) -> Dict[str, Any]:
    from detector.model_registry import XCEPTION_MODEL
    if XCEPTION_MODEL is None:
        return {'model_name': 'Xception-FaceForensics', 'error': 'Model not loaded', 'verdict': 'ERROR', 'fake_prob': None}

    tensor = XCEPTION_TRANSFORM(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out = XCEPTION_MODEL(tensor)
        fake_prob = torch.sigmoid(out).item()
    fake_pct = round(fake_prob * 100, 2)
    return {
        'model_name': 'Xception-FaceForensics',
        'fake_prob':  fake_pct,
        'real_prob':  round((1 - fake_prob) * 100, 2),
        'verdict':    _verdict(fake_pct),
    }


def run_efficientnet(image: Image.Image) -> Dict[str, Any]:
    from detector.model_registry import EFFICIENTNET_MODEL
    if EFFICIENTNET_MODEL is None:
        return {'model_name': 'EfficientNet-B0 (Custom)', 'error': 'Model not loaded', 'verdict': 'ERROR', 'fake_prob': None}

    tensor = EFFICIENTNET_TRANSFORM(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out  = EFFICIENTNET_MODEL(tensor)
        prob = torch.softmax(out, dim=1).squeeze().tolist()
    # index 0 = real, index 1 = fake
    fake_pct = round(prob[1] * 100, 2)
    return {
        'model_name': 'EfficientNet-B0 (Custom)',
        'fake_prob':  fake_pct,
        'real_prob':  round(prob[0] * 100, 2),
        'verdict':    _verdict(fake_pct),
    }


def compute_ensemble(results: List[Dict]) -> Dict[str, Any]:
    valid = [r for r in results if r.get('fake_prob') is not None]
    if not valid:
        return {'model_name': 'Ensemble (Average)', 'verdict': 'ERROR', 'fake_prob': None, 'real_prob': None}
    avg = sum(r['fake_prob'] for r in valid) / len(valid)
    avg = round(avg, 2)
    return {
        'model_name':    'Ensemble (Average)',
        'fake_prob':     avg,
        'real_prob':     round(100 - avg, 2),
        'verdict':       _verdict(avg),
        'models_used':   len(valid),
    }


def analyze_image(image: Image.Image, filename=None) -> Dict[str, Any]:
    image = image.convert('RGB')
    model_results = []

    for runner in [run_siglip, run_xception, run_efficientnet]:
        try:
            model_results.append(runner(image))
        except Exception as e:
            model_results.append({
                'model_name': runner.__name__,
                'error':      str(e),
                'fake_prob':  None,
                'verdict':    'ERROR',
            })

    ensemble = compute_ensemble(model_results)
    return {
        'media_type':    'image',
        'model_results': model_results,
        'ensemble':      ensemble,
    }