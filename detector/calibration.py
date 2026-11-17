"""
calibration.py
---------------
Optional learned combination of the model scores.

`python manage.py calibrate` fits a small logistic regression on your labelled
test set (the scores in eval_results.csv) and saves it to weights/calibration.json.
When that file exists, the ensemble uses it instead of a plain average, so a
model that is often wrong on your data counts for less.
Delete the file to go back to the plain average.
"""

import json
import math
import os

_CACHE = {'mtime': None, 'data': None}


def _path():
    from django.conf import settings
    return os.path.join(str(settings.BASE_DIR), 'weights', 'calibration.json')


def load():
    """Returns the calibration dict, or None if there is no (valid) file."""
    path = _path()
    try:
        mtime = os.path.getmtime(path)
    except OSError:
        return None
    if _CACHE['mtime'] != mtime:
        try:
            with open(path, encoding='utf-8') as fh:
                _CACHE['data'] = json.load(fh)
        except (OSError, ValueError):
            _CACHE['data'] = None
        _CACHE['mtime'] = mtime
    return _CACHE['data']


def logit(pct):
    p = min(max(pct / 100.0, 0.01), 0.99)
    return math.log(p / (1 - p))


def features(scores, models):
    """scores: {model_name: 0-100 or None}. Missing scores count as neutral (50%)."""
    return [logit(scores[m]) if scores.get(m) is not None else 0.0 for m in models]


def predict(cal, scores):
    """Calibrated fake probability (0-100), or None if no model in the file scored."""
    models = cal['models']
    if not any(scores.get(m) is not None for m in models):
        return None
    z = cal['bias'] + sum(w * x for w, x in zip(cal['weights'], features(scores, models)))
    return round(100.0 / (1.0 + math.exp(-z)), 2)


def verdict(cal, prob):
    if prob >= cal['fake_from']:
        return 'FAKE'
    if prob < cal['real_below']:
        return 'REAL'
    return 'UNCERTAIN'
