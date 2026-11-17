"""
learning.py
------------
Learns from expert reviews.

When experts have marked at least 50 images FAKE for the same reason (and at
least 50 images REAL), the system:
  1. trains an "Expert-trained" detector: a small classifier on top of the
     SigLIP image features, using those reviewed images;
  2. re-learns how much to trust every detector (the calibration weights);
  3. checks both on your labelled test set (testset/real, testset/fake);
  4. switches them on only if the new detector on its own beats chance clearly
     (AUC of at least 0.65) and the app's labels improve overall: each correct
     label counts +1, each wrong label -2, UNCERTAIN counts 0.

It runs by itself in the background after each expert review once the
thresholds are met, and again after every 50 further reviews. An admin can
also start it from the dashboard or with `python manage.py learn`.

Test-set images that were also uploaded and reviewed are left out of training,
so the check stays fair.
"""

import hashlib
import json
import os
import threading
import time

import numpy as np
import torch

from detector import calibration
from detector import image_detector as det
from detector import model_registry as registry

MIN_AUC = 0.65
MIN_FAKE_SAME_REASON = 50
MIN_REAL = 50
RETRAIN_EVERY = 50
FOLDS = 5
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}

_RUN_LOCK = threading.Lock()
_STATUS_LOCK = threading.Lock()


# -- Files -------------------------------------------------------------------

def _path(name):
    from django.conf import settings
    return os.path.join(str(settings.BASE_DIR), 'weights', name)


def _testset_dir():
    from django.conf import settings
    return getattr(settings, 'LEARN_TESTSET', os.path.join(str(settings.BASE_DIR), 'testset'))


def _write_json(name, data):
    path = _path(name)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, indent=2)
    os.replace(tmp, path)


def read_status():
    try:
        with open(_path('learning_status.json'), encoding='utf-8') as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def _update_status(**fields):
    with _STATUS_LOCK:
        status = read_status()
        status.update(fields)
        _write_json('learning_status.json', status)
        return status


# -- Image features and the expert-trained head -------------------------------

def _backbone():
    """The SigLIP model whose image features the expert-trained detector uses."""
    if registry.SIGLIP_MODEL is not None:
        return 'siglip', registry.SIGLIP_MODEL, registry.SIGLIP_PROCESSOR
    if registry.AIHUMAN_MODEL is not None:
        return 'aihuman', registry.AIHUMAN_MODEL, registry.AIHUMAN_PROCESSOR
    return None, None, None


def embed(image, which=None):
    """Mean-pooled SigLIP patch features (the same vector its classifier reads)."""
    key, model, processor = _backbone()
    if which is not None and which != key:
        raise RuntimeError(f'expert detector was trained on {which} features, but {key} is loaded')
    if model is None:
        raise RuntimeError('no SigLIP model is loaded')
    inputs = processor(images=image.convert('RGB'), return_tensors='pt').to(registry.DEVICE)
    with torch.no_grad():
        out = model.vision_model(pixel_values=inputs['pixel_values'])
    v = out.last_hidden_state.mean(dim=1)[0].float().cpu().numpy()
    return v / (np.linalg.norm(v) + 1e-8)


def head_predict(head, X):
    """Fake probability 0-100 for each row of X."""
    Z = (np.atleast_2d(X) - head['mean']) / head['std']
    return 100.0 / (1.0 + np.exp(-(head['bias'] + Z @ head['weights'])))


def _fit_head(X, y):
    from detector.management.commands.calibrate import fit
    mean, std = X.mean(axis=0), X.std(axis=0) + 1e-6
    bias, weights = fit((X - mean) / std, y, lam=float(X.shape[1]) / 20.0)
    return {'mean': mean, 'std': std, 'bias': float(bias), 'weights': weights}


def load_head():
    """Called at server start. Puts a saved expert-trained detector into the registry."""
    path = _path('expert_detector.npz')
    if not os.path.exists(path):
        return
    try:
        data = np.load(path, allow_pickle=False)
        head = {k: data[k] for k in ('mean', 'std', 'weights')}
        head['bias'] = float(data['bias'])
        head['backbone'] = str(data['backbone'])
        head['meta'] = read_status().get('live', {})
        if head['backbone'] != _backbone()[0]:
            raise RuntimeError(f'trained on {head["backbone"]} features, which are not loaded')
        registry.EXPERT_HEAD = head
        print(f'[Learning] OK expert-trained detector loaded ({head["meta"].get("trained_on", "?")} reviews).')
    except Exception as e:
        registry.EXPERT_HEAD = None
        print(f'[Learning] FAILED to load the expert-trained detector: {e}')


def run_expert(image):
    head = registry.EXPERT_HEAD
    if head is None:
        return det._unavailable(det.EXPERT_NAME, 'ERROR', 'Not trained yet')
    prob = float(head_predict(head, embed(image, head['backbone']))[0])
    return det._result(det.EXPERT_NAME, prob / 100.0)


# -- What the experts have said so far ----------------------------------------

def _sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def _testset_files():
    root, files = _testset_dir(), []
    for label_name, label in (('real', 0), ('fake', 1)):
        folder = os.path.join(root, label_name)
        if os.path.isdir(folder):
            for f in sorted(os.listdir(folder)):
                if os.path.splitext(f)[1].lower() in IMAGE_EXTS:
                    files.append((os.path.join(folder, f), label))
    return files


_HASHES = {'sig': None, 'hashes': set()}


def _testset_hashes():
    files = _testset_files()
    sig = tuple((p, os.path.getsize(p), int(os.path.getmtime(p))) for p, _ in files)
    if _HASHES['sig'] != sig:
        _HASHES['hashes'] = {_sha256(p) for p, _ in files}
        _HASHES['sig'] = sig
    return _HASHES['hashes']


def collect():
    """Reviewed images, grouped reasons and whether the thresholds are met."""
    from detector.models import ScanResult
    from detector.reasons import group_reasons, is_valid

    held_out = _testset_hashes()
    scans = (ScanResult.objects
             .filter(status='REVIEWED', media_type='image', expert_review__verdict__in=['FAKE', 'REAL'])
             .select_related('expert_review'))
    rows = []
    for s in scans:
        if not s.media_file or (s.file_hash and s.file_hash in held_out):
            continue
        if not s.media_file.storage.exists(s.media_file.name):
            continue                                   # file deleted from media/uploads
        rows.append({'scan': s, 'label': 1 if s.expert_review.verdict == 'FAKE' else 0,
                     'reason': s.expert_review.reasoning or ''})

    fakes = [r for r in rows if r['label'] == 1 and is_valid(r['reason'])]
    reals = [r for r in rows if r['label'] == 0]
    groups = group_reasons([(r['scan'].id, r['reason']) for r in fakes])
    qualifying = [g for g in groups if len(g['ids']) >= MIN_FAKE_SAME_REASON]
    return {'rows': rows, 'fakes': fakes, 'reals': reals, 'groups': groups, 'qualifying': qualifying,
            'ready': bool(qualifying) and len(reals) >= MIN_REAL}


def _progress(info):
    top = info['groups'][0] if info['groups'] else None
    return {
        'thresholds': {'fake_same_reason': MIN_FAKE_SAME_REASON, 'real': MIN_REAL, 'retrain_every': RETRAIN_EVERY},
        'reviews': {'fake': len(info['fakes']), 'real': len(info['reals'])},
        'largest_reason': {'label': top['label'], 'count': len(top['ids']), 'examples': top['examples']} if top else None,
        'reasons': [{'label': g['label'], 'count': len(g['ids']), 'examples': g['examples']}
                    for g in info['groups'][:8]],
        'ready': info['ready'],
    }


def maybe_start(force=False):
    """Cheap check after each review; starts training in the background when due."""
    info = collect()
    status = _update_status(progress=_progress(info))
    if not info['ready'] or _RUN_LOCK.locked():
        return False
    from django.conf import settings
    if not force and not getattr(settings, 'LEARNING_AUTO_RUN', False):
        return False          # run it from the admin dashboard or `python manage.py learn`
    n = sum(len(g['ids']) for g in info['qualifying']) + len(info['reals'])
    if not force and n - status.get('last_run_reviews', 0) < RETRAIN_EVERY:
        return False
    threading.Thread(target=_run_safely, name='expert-learning', daemon=True).start()
    return True


def _run_safely():
    from django.db import connection
    try:
        run()
    except Exception as e:
        # Remember the review count, so a broken run is not retried after every single review.
        info = collect()
        n = sum(len(g['ids']) for g in info['qualifying']) + len(info['reals'])
        _update_status(state='failed', error=str(e), finished_at=time.strftime('%Y-%m-%d %H:%M'),
                       last_run_reviews=n)
        print(f'[Learning] FAILED: {e}')
    finally:
        connection.close()


# -- Scoring the test set (cached, the detectors do not change) ---------------

def _testset_scores(base_models, backbone_key, log):
    cache_path = _path('testset_scores.json')
    try:
        with open(cache_path, encoding='utf-8') as fh:
            cache = json.load(fh)
    except (OSError, ValueError):
        cache = {}
    from PIL import Image

    rows, changed = [], False
    files = _testset_files()
    for i, (path, label) in enumerate(files, 1):
        key = f'{path}|{os.path.getsize(path)}|{int(os.path.getmtime(path))}'
        entry = cache.get(key, {})
        need_scores = any(m not in entry.get('scores', {}) for m in base_models)
        need_embed = entry.get('backbone') != backbone_key
        if need_scores or need_embed:
            image = Image.open(path).convert('RGB')
            if need_scores:
                entry['scores'] = {r['model_name']: r.get('fake_prob')
                                   for r in (runner(image) for name, runner in det.MODEL_RUNNERS)}
            if need_embed:
                entry['embedding'] = [round(float(x), 6) for x in embed(image)]
                entry['backbone'] = backbone_key
            cache[key] = entry
            changed = True
        rows.append({'label': label, 'scores': entry['scores'], 'embedding': np.array(entry['embedding'])})
        if i % 25 == 0:
            log(f'  test set {i}/{len(files)} scored')
    if changed:
        _write_json('testset_scores.json', cache)
    return rows


# -- The training run ---------------------------------------------------------

def run(log=print):
    from detector.management.commands.calibrate import fit, outcome
    from PIL import Image

    if not _RUN_LOCK.acquire(blocking=False):
        log('Learning is already running.')
        return None
    try:
        started = time.strftime('%Y-%m-%d %H:%M')
        _update_status(state='running', started_at=started, error='')
        info = collect()
        _update_status(progress=_progress(info))
        if not info['ready']:
            msg = (f'Not enough reviews yet: need {MIN_FAKE_SAME_REASON} FAKE reviews with the same reason '
                   f'and {MIN_REAL} REAL reviews.')
            _update_status(state='waiting', message=msg)
            log(msg)
            return None

        backbone_key = _backbone()[0]
        if backbone_key is None:
            raise RuntimeError('no SigLIP model is loaded, so there are no image features to learn from')

        qualifying_ids = {i for g in info['qualifying'] for i in g['ids']}
        train = [r for r in info['fakes'] if r['scan'].id in qualifying_ids] + info['reals']
        others = [r for r in info['fakes'] if r['scan'].id not in qualifying_ids]
        log(f'Training on {len(train) - len(info["reals"])} FAKE reviews '
            f'({", ".join(g["label"] for g in info["qualifying"])}) and {len(info["reals"])} REAL reviews.')

        def features(rows):
            out = []
            for r in rows:
                with r['scan'].media_file.open('rb') as fh:
                    out.append(embed(Image.open(fh).convert('RGB')))
            return np.array(out)

        X_train = features(train)
        y_train = np.array([r['label'] for r in train])
        X_other = features(others) if others else np.zeros((0, X_train.shape[1]))

        # Out-of-fold scores, so calibration never sees a score made on its own image.
        oof = np.zeros(len(train))
        order = np.random.RandomState(0).permutation(len(train))
        for k in range(FOLDS):
            hold = order[k::FOLDS]
            keep = np.setdiff1d(order, hold)
            oof[hold] = head_predict(_fit_head(X_train[keep], y_train[keep]), X_train[hold])
        head = _fit_head(X_train, y_train)
        other_scores = head_predict(head, X_other) if len(others) else np.zeros(0)

        # Candidate calibration over all detectors, from the reviewed images.
        base = [name for name, _ in det.MODEL_RUNNERS]
        models = base + [det.EXPERT_NAME]
        cal_rows = train + others
        expert_scores = list(oof) + list(other_scores)
        Xc = np.array([calibration.features(
            {**{m: getattr(r['scan'], det.SCORE_FIELDS[m]) for m in base}, det.EXPERT_NAME: e}, models)
            for r, e in zip(cal_rows, expert_scores)])
        yc = np.array([r['label'] for r in cal_rows])
        cb, cw = fit(Xc, yc)
        live_cal = calibration.load() or {}
        candidate_cal = {
            'models': models, 'weights': [round(float(x), 6) for x in cw], 'bias': round(float(cb), 6),
            'real_below': live_cal.get('real_below', 30.0), 'fake_from': live_cal.get('fake_from', 70.0),
            'trained_on': {'real': int((yc == 0).sum()), 'fake': int((yc == 1).sum())},
            'source': 'expert reviews',
        }

        # The check: same test set, current setup vs the candidate.
        log('Scoring the test set...')
        test = _testset_scores(base, backbone_key, log)
        if len(test) < 2 or len({r['label'] for r in test}) < 2:
            raise RuntimeError('the test set needs real and fake images (testset/real, testset/fake)')
        labels = [r['label'] for r in test]

        def live_label(r):
            scores = dict(r['scores'])
            if registry.EXPERT_HEAD is not None and registry.EXPERT_HEAD['backbone'] == backbone_key:
                scores[det.EXPERT_NAME] = float(head_predict(registry.EXPERT_HEAD, r['embedding'])[0])
            results = [{'model_name': m, 'fake_prob': p} for m, p in scores.items()]
            return det.compute_ensemble(results)['verdict']

        def candidate_label(r):
            scores = {**r['scores'], det.EXPERT_NAME: float(head_predict(head, r['embedding'])[0])}
            prob = calibration.predict(candidate_cal, scores)
            return calibration.verdict(candidate_cal, prob) if prob is not None else 'UNCERTAIN'

        now = outcome(labels, test, lambda r: live_label(r))
        new = outcome(labels, test, lambda r: candidate_label(r))
        from detector.management.commands.evaluate import auc
        alone_scores = [float(head_predict(head, r['embedding'])[0]) for r in test]
        expert_alone = outcome(labels, alone_scores, lambda p: 'FAKE' if p >= 50 else 'REAL')
        expert_auc = auc(list(zip(labels, alone_scores))) or 0.0

        def points(c):
            return (c['fake_ok'] + c['real_ok']) - 2 * c['wrong']
        better = expert_auc >= MIN_AUC and points(new) > points(now)

        summary = {
            'finished_at': time.strftime('%Y-%m-%d %H:%M'),
            'trained_on': len(train),
            'reasons': [g['label'] for g in info['qualifying']],
            'test_images': len(test),
            'before': now, 'after': new, 'expert_detector_alone': expert_alone,
            'expert_detector_auc': round(expert_auc, 3), 'points_before': points(now), 'points_after': points(new),
            'accepted': better,
        }
        n = sum(len(g['ids']) for g in info['qualifying']) + len(info['reals'])

        if better:
            np.savez(_path('expert_detector.npz.tmp.npz'), mean=head['mean'], std=head['std'],
                     weights=head['weights'], bias=np.array(head['bias']), backbone=np.array(backbone_key))
            os.replace(_path('expert_detector.npz.tmp.npz'), _path('expert_detector.npz'))
            from django.conf import settings
            if getattr(settings, 'LEARNING_UPDATES_CALIBRATION', False):
                _write_json('calibration.json', candidate_cal)
            else:
                _write_json('calibration.proposed.json', candidate_cal)   # an admin decides
            head['backbone'] = backbone_key
            head['meta'] = summary
            registry.EXPERT_HEAD = head
            message = (f'Switched on. On the test set: wrong labels {now["wrong"]} -> {new["wrong"]}, '
                       f'correct labels {now["fake_ok"] + now["real_ok"]} -> {new["fake_ok"] + new["real_ok"]}.')
            _update_status(state='live', message=message, last_run=summary, live=summary, last_run_reviews=n)
        else:
            why = (f'the new detector alone scored AUC {expert_auc:.2f} on the test set (needs {MIN_AUC})'
                   if expert_auc < MIN_AUC else
                   f'labels did not improve (wrong {now["wrong"]} -> {new["wrong"]}, '
                   f'correct {now["fake_ok"] + now["real_ok"]} -> {new["fake_ok"] + new["real_ok"]})')
            message = f'Kept the current setup: {why}.'
            _update_status(state='rejected', message=message, last_run=summary, last_run_reviews=n)
        log(message)
        return summary
    finally:
        _RUN_LOCK.release()
