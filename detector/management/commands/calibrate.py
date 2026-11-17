"""
Learn how much to trust each model from your labelled test set.

    python manage.py evaluate testset          (writes eval_results.csv)
    python manage.py calibrate                 (reads it, writes weights/calibration.json)

Fits a small logistic regression on the per-model scores. Accuracy is checked
with leave-one-out (each file is scored by a model trained without it), so the
numbers are honest even on a small set. The file is only written when it beats
the plain average and there are enough images, unless you pass --force.

Delete weights/calibration.json to go back to the plain average.
"""

import csv
import json
import os

import numpy as np
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from detector import calibration
from detector import image_detector as det
from detector.management.commands.evaluate import SHORT

MIN_PER_CLASS = 20


def fit(X, y, lam=1.0, iters=50):
    """Class-balanced, L2-regularised logistic regression (bias not penalised)."""
    n, k = X.shape
    Xb = np.hstack([np.ones((n, 1)), X])
    n_pos, n_neg = y.sum(), n - y.sum()
    sw = np.where(y == 1, n / (2 * max(n_pos, 1)), n / (2 * max(n_neg, 1)))
    reg = lam * np.eye(k + 1)
    reg[0, 0] = 0.0
    w = np.zeros(k + 1)
    for _ in range(iters):
        p = 1 / (1 + np.exp(-Xb @ w))
        grad = Xb.T @ (sw * (p - y)) + reg @ w
        hess = Xb.T @ (Xb * (sw * p * (1 - p))[:, None]) + reg + 1e-6 * np.eye(k + 1)
        step = np.linalg.solve(hess, grad)
        w -= step
        if np.abs(step).max() < 1e-8:
            break
    return w[0], w[1:]


def outcome(labels, probs, label_fn):
    """Counts of what the app would show."""
    c = {'fake_ok': 0, 'fake_unc': 0, 'fake_wrong': 0, 'real_ok': 0, 'real_unc': 0, 'real_wrong': 0}
    for y, p in zip(labels, probs):
        v = label_fn(p)
        if y == 1:
            c['fake_ok' if v == 'FAKE' else 'fake_unc' if v == 'UNCERTAIN' else 'fake_wrong'] += 1
        else:
            c['real_ok' if v == 'REAL' else 'real_unc' if v == 'UNCERTAIN' else 'real_wrong'] += 1
    c['wrong'] = c['fake_wrong'] + c['real_wrong']
    return c


def describe(name, c):
    return (f'{name:<34} fakes: {c["fake_ok"]} FAKE / {c["fake_unc"]} UNCERTAIN / {c["fake_wrong"]} wrongly REAL   '
            f'reals: {c["real_ok"]} REAL / {c["real_unc"]} UNCERTAIN / {c["real_wrong"]} wrongly FAKE')


class Command(BaseCommand):
    help = 'Learn per-model weights from eval_results.csv and save weights/calibration.json.'

    def add_arguments(self, parser):
        parser.add_argument('--csv', default='eval_results.csv', help='Scores written by `manage.py evaluate`')
        parser.add_argument('--real-below', type=float, default=30.0, help='Calibrated score below this = REAL')
        parser.add_argument('--fake-from', type=float, default=70.0, help='Calibrated score from this = FAKE')
        parser.add_argument('--force', action='store_true', help='Save even with few images or no improvement')

    def handle(self, *args, **opts):
        path = opts['csv']
        if not os.path.exists(path):
            raise CommandError(f'{path} not found. Run `python manage.py evaluate testset` first.')
        with open(path, newline='', encoding='utf-8') as fh:
            rows = list(csv.DictReader(fh))
        if not rows:
            raise CommandError(f'{path} is empty.')

        enabled = [name for name, _ in det.active_runners()]
        models = [m for m in enabled if SHORT.get(m) in rows[0]]
        absent = [SHORT.get(m, m) for m, _ in det.MODEL_RUNNERS if SHORT.get(m) not in rows[0]]
        if absent and not opts['force']:
            raise CommandError(f'{", ".join(absent)} has no scores in {path}. Re-run evaluate first.')
        if not models:
            raise CommandError('The CSV has no columns for the enabled models. Re-run evaluate.')

        def score(row, m):
            v = row.get(SHORT[m], '')
            return float(v) if v not in ('', 'None') else None

        labels = np.array([1 if r['label'] == 'fake' else 0 for r in rows])
        scores = [{m: score(r, m) for m in models} for r in rows]
        X = np.array([calibration.features(s, models) for s in scores])
        n_fake, n_real = int(labels.sum()), int(len(labels) - labels.sum())
        self.stdout.write(f'{n_real} real, {n_fake} fake, models: {", ".join(SHORT[m] for m in models)}\n')
        if min(n_fake, n_real) < 2:
            raise CommandError('Need at least 2 real and 2 fake files.')

        bands = {'real_below': opts['real_below'], 'fake_from': opts['fake_from']}

        # Leave-one-out: every file is predicted by a model that never saw it.
        loo = []
        for i in range(len(rows)):
            keep = np.arange(len(rows)) != i
            b, w = fit(X[keep], labels[keep])
            loo.append(float(100 / (1 + np.exp(-(b + X[i] @ w)))))

        avg = []
        for s in scores:
            vals = [v for v in s.values() if v is not None]
            avg.append(sum(vals) / len(vals) if vals else 50.0)

        now = outcome(labels, avg, det._verdict)
        cal = outcome(labels, loo, lambda p: calibration.verdict(bands, p))
        self.stdout.write(describe(f'Plain average ({det.REAL_BELOW}/{det.FAKE_FROM})', now))
        self.stdout.write(describe(f'Calibrated, leave-one-out ({bands["real_below"]:.0f}/{bands["fake_from"]:.0f})', cal))

        b, w = fit(X, labels)
        self.stdout.write('\nWeights (bigger = trusted more; negative = the model points the wrong way on your data):')
        for m, wi in zip(models, w):
            self.stdout.write(f'  {SHORT[m]:<14} {wi:+.2f}')

        better = cal['wrong'] < now['wrong'] or (cal['wrong'] == now['wrong'] and
                                                  cal['fake_unc'] + cal['real_unc'] <= now['fake_unc'] + now['real_unc'])
        enough = min(n_fake, n_real) >= MIN_PER_CLASS
        if not opts['force'] and not (better and enough):
            reasons = []
            if not enough:
                reasons.append(f'fewer than {MIN_PER_CLASS} images in a class')
            if not better:
                reasons.append('it does not beat the plain average')
            self.stdout.write(f'\nNOT saved: {" and ".join(reasons)}. Add images and re-run, '
                              f'or pass --force to save anyway.')
            return

        out = os.path.join(str(settings.BASE_DIR), 'weights', 'calibration.json')
        with open(out, 'w', encoding='utf-8') as fh:
            json.dump({
                'models':     models,
                'weights':    [round(float(x), 6) for x in w],
                'bias':       round(float(b), 6),
                'real_below': bands['real_below'],
                'fake_from':  bands['fake_from'],
                'trained_on': {'real': n_real, 'fake': n_fake},
            }, fh, indent=2)
        self.stdout.write(f'\nSaved {out}. Restart the server to use it. Delete the file to undo.')
