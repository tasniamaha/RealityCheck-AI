"""
video_detector.py
------------------
Extracts frames from a video, runs every enabled model on each frame (same code
path as images), averages per-model scores, then computes the ensemble.
"""

import cv2
from PIL import Image
from typing import Dict, Any, List

from detector.image_detector import (
    active_runners, compute_ensemble, _result, _unavailable,
)

FRAME_SKIP = 10   # analyze 1 in every 10 frames


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


def _run_on_frames(name: str, runner, frames: List[Image.Image]) -> Dict[str, Any]:
    """Average a model's fake probability over every frame it could score."""
    probs, last = [], None
    for frame in frames:
        last = runner(frame)
        if last.get('fake_prob') is not None:
            probs.append(last['fake_prob'] / 100)
        elif last.get('verdict') == 'ERROR':
            break   # model not loaded - no point trying the other frames

    if not probs:
        result = _unavailable(name, last['verdict'], last.get('error', 'No frames scored'))
    else:
        result = _result(name, sum(probs) / len(probs))
    result['frames_analyzed'] = len(probs)
    return result


def analyze_video(video_path: str) -> Dict[str, Any]:
    frames = _extract_frames(video_path)
    if not frames:
        return {'error': 'No frames could be extracted. Check the video file.'}

    model_results = []
    for name, runner in active_runners():
        try:
            model_results.append(_run_on_frames(name, runner, frames))
        except Exception as e:
            result = _unavailable(name, 'ERROR', str(e))
            result['frames_analyzed'] = 0
            model_results.append(result)

    return {
        'media_type':           'video',
        'model_results':        model_results,
        'ensemble':             compute_ensemble(model_results),
        'total_frames_sampled': len(frames),
    }
