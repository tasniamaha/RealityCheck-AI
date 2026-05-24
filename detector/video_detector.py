"""
video_detector.py
------------------
Extracts frames from a video, runs all 3 models on each frame,
averages per-model scores, then computes ensemble.
"""

import cv2
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from typing import Dict, Any, List

DEVICE     = 'cuda' if torch.cuda.is_available() else 'cpu'
FRAME_SKIP = 10   # analyze 1 in every 10 frames

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


def _extract_frames(video_path: str) -> List[Image.Image]:
    cap, frames, idx = cv2.VideoCapture(video_path), [], 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        idx += 1
        if idx % FRAME_SKIP == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb))
    cap.release()
    return frames


def _run_siglip_on_frames(frames: List[Image.Image]) -> Dict[str, Any]:
    from detector.model_registry import SIGLIP_MODEL, SIGLIP_PROCESSOR
    if SIGLIP_MODEL is None:
        return {'model_name': 'SigLIP (HuggingFace)', 'error': 'Model not loaded', 'verdict': 'ERROR', 'fake_prob': None}

    fake_probs = []
    for img in frames:
        inputs = SIGLIP_PROCESSOR(images=img, return_tensors='pt')
        with torch.no_grad():
            logits = SIGLIP_MODEL(**inputs).logits
        probs = F.softmax(logits, dim=1).squeeze().tolist()
        fake_probs.append(probs[0])  # index 0 = fake

    avg = (sum(fake_probs) / len(fake_probs)) if fake_probs else 0.5
    fake_pct = round(avg * 100, 2)
    return {
        'model_name':      'SigLIP (HuggingFace)',
        'fake_prob':       fake_pct,
        'real_prob':       round((1 - avg) * 100, 2),
        'frames_analyzed': len(fake_probs),
        'verdict':         _verdict(fake_pct),
    }


def _run_xception_on_frames(frames: List[Image.Image]) -> Dict[str, Any]:
    from detector.model_registry import XCEPTION_MODEL
    if XCEPTION_MODEL is None:
        return {'model_name': 'Xception-FaceForensics', 'error': 'Model not loaded', 'verdict': 'ERROR', 'fake_prob': None}

    fake_probs = []
    for img in frames:
        tensor = XCEPTION_TRANSFORM(img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            out = XCEPTION_MODEL(tensor)
            fake_probs.append(torch.sigmoid(out).item())

    avg = (sum(fake_probs) / len(fake_probs)) if fake_probs else 0.5
    fake_pct = round(avg * 100, 2)
    return {
        'model_name':      'Xception-FaceForensics',
        'fake_prob':       fake_pct,
        'real_prob':       round((1 - avg) * 100, 2),
        'frames_analyzed': len(fake_probs),
        'verdict':         _verdict(fake_pct),
    }


def _run_efficientnet_on_frames(frames: List[Image.Image]) -> Dict[str, Any]:
    from detector.model_registry import EFFICIENTNET_MODEL
    if EFFICIENTNET_MODEL is None:
        return {'model_name': 'EfficientNet-B0 (Custom)', 'error': 'Model not loaded', 'verdict': 'ERROR', 'fake_prob': None}

    fake_probs = []
    for img in frames:
        tensor = EFFICIENTNET_TRANSFORM(img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            out  = EFFICIENTNET_MODEL(tensor)
            prob = torch.softmax(out, dim=1).squeeze().tolist()
        fake_probs.append(prob[1])  # index 1 = fake

    avg = (sum(fake_probs) / len(fake_probs)) if fake_probs else 0.5
    fake_pct = round(avg * 100, 2)
    return {
        'model_name':      'EfficientNet-B0 (Custom)',
        'fake_prob':       fake_pct,
        'real_prob':       round((1 - avg) * 100, 2),
        'frames_analyzed': len(fake_probs),
        'verdict':         _verdict(fake_pct),
    }


def analyze_video(video_path: str) -> Dict[str, Any]:
    frames = _extract_frames(video_path)
    if not frames:
        return {'error': 'No frames could be extracted. Check the video file.'}

    model_results = []
    for runner in [_run_siglip_on_frames, _run_xception_on_frames, _run_efficientnet_on_frames]:
        try:
            model_results.append(runner(frames))
        except Exception as e:
            model_results.append({
                'model_name':      runner.__name__,
                'error':           str(e),
                'fake_prob':       None,
                'verdict':         'ERROR',
                'frames_analyzed': 0,
            })

    valid   = [r for r in model_results if r.get('fake_prob') is not None]
    avg_fake = round(sum(r['fake_prob'] for r in valid) / len(valid), 2) if valid else None

    ensemble = {
        'model_name':  'Ensemble (Average)',
        'fake_prob':   avg_fake,
        'real_prob':   round(100 - avg_fake, 2) if avg_fake is not None else None,
        'verdict':     _verdict(avg_fake) if avg_fake is not None else 'ERROR',
        'models_used': len(valid),
    }

    return {
        'media_type':          'video',
        'model_results':       model_results,
        'ensemble':            ensemble,
        'total_frames_sampled': len(frames),
    }