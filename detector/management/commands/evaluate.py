"""
Measure real accuracy on a labelled test set.

    python manage.py evaluate testset
    python manage.py evaluate testset --candidate <huggingface-model-id>

Folder layout:
    testset/real/*.jpg|png|mp4...
    testset/fake/*.jpg|png|mp4...

Prints per-model and ensemble metrics and writes every score to a CSV
(which `python manage.py calibrate` reads).
--candidate also scores another Hugging Face detector (images only) so you can
see whether it beats the current one before switching to it.
"""

import csv
import itertools
import os

import torch
import torch.nn.functional as F
from django.core.management.base import BaseCommand, CommandError
from PIL import Image

from detector import calibration
from detector import image_detector as det
from detector import model_registry as registry
from detector.provenance import check_provenance
from detector.video_detector import analyze_video

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
VIDEO_EXTS = {'.mp4', '.avi', '.mov', '.mkv'}
SHORT = {det.SIGLIP_NAME: 'SigLIP', det.XCEPTION_NAME: 'Xception', det.EFFICIENTNET_NAME: 'EfficientNet',
         det.AIHUMAN_NAME: 'AI-vs-Human', det.EXPERT_NAME: 'Expert-trained'}
WIDTH = 62


def auc(pairs):
    """pairs: [(label 1=fake/0=real, score)]. Probability a fake outranks a real."""
    pos = [s for y, s in pairs if y == 1]
    neg = [s for y, s in pairs if y == 0]
    if not pos or not neg:
        return None
    wins = sum((p > n) + 0.5 * (p == n) for p in pos for n in neg)
    return wins / (len(pos) * len(neg))


def confusion(pairs, threshold):
    tp = sum(1 for y, s in pairs if y == 1 and s >= threshold)
    fn = sum(1 for y, s in pairs if y == 1 and s < threshold)
    tn = sum(1 for y, s in pairs if y == 0 and s < threshold)
    fp = sum(1 for y, s in pairs if y == 0 and s >= threshold)
    return tp, fn, tn, fp


def balanced_acc(pairs, threshold):
    tp, fn, tn, fp = confusion(pairs, threshold)
    if not (tp + fn) or not (tn + fp):
        return None
    return (tp / (tp + fn) + tn / (tn + fp)) / 2


def summarize(name, pairs, total):
    """One table row. Scores are 0-100 fake probability."""
    name = name[:WIDTH]
    if not pairs:
        return f'{name:<{WIDTH}} scored 0/{total}'
    tp, fn, tn, fp = confusion(pairs, 50)
    acc = (tp + tn) / len(pairs)
    a = auc(pairs)
    best_t, best_b = 50, balanced_acc(pairs, 50)
    for t in range(5, 100, 5):
        b = balanced_acc(pairs, t)
        if b is not None and (best_b is None or b > best_b):
            best_t, best_b = t, b
    fmt = lambda v: '  n/a' if v is None else f'{v * 100:5.1f}'
    fake_recall = tp / (tp + fn) if tp + fn else None
    real_recall = tn / (tn + fp) if tn + fp else None
    return (f'{name:<{WIDTH}} {len(pairs):>4}/{total:<4} {fmt(acc)}  {fmt(fake_recall)}  '
            f'{fmt(real_recall)}  {fmt(a)}   TP={tp} FN={fn} TN={tn} FP={fp}   '
            f'best thr {best_t} ({fmt(best_b).strip()})')


def average(row, names):
    vals = [row[n] for n in names if row.get(n) is not None]
    return sum(vals) / len(vals) if vals else None


class Command(BaseCommand):
    help = 'Evaluate each model and the ensemble on testset/real and testset/fake.'

    def add_arguments(self, parser):
        parser.add_argument('testset', help='Folder containing real/ and fake/ subfolders')
        parser.add_argument('--csv', default='eval_results.csv', help='Where to write per-file scores')
        parser.add_argument('--candidate', action='append', default=[], metavar='MODEL_ID',
                            help='Also score this Hugging Face image classifier (repeatable)')

    def handle(self, *args, **opts):
        root = opts['testset']
        files = []
        for label_name, label in (('real', 0), ('fake', 1)):
            folder = os.path.join(root, label_name)
            if not os.path.isdir(folder):
                raise CommandError(f'Missing folder: {folder}')
            for f in sorted(os.listdir(folder)):
                if os.path.splitext(f)[1].lower() in IMAGE_EXTS | VIDEO_EXTS:
                    files.append((os.path.join(folder, f), label))
        if not files:
            raise CommandError('No images or videos found.')

        n_real = sum(1 for _, y in files if y == 0)
        n_fake = len(files) - n_real
        small = min(n_real, n_fake) < 50
        self.stdout.write(f'Test set: {n_real} real, {n_fake} fake\n')
        if small:
            self.stdout.write('WARNING: fewer than 50 files in a class - treat these numbers as a smoke test only.\n')

        models = [name for name, _ in det.active_runners()]
        candidates = self._load_candidates(opts['candidate'])

        rows = []
        for i, (path, label) in enumerate(files, 1):
            is_video = os.path.splitext(path)[1].lower() in VIDEO_EXTS
            try:
                if is_video:
                    results, image = analyze_video(path).get('model_results', []), None
                else:
                    image = Image.open(path).convert('RGB')
                    results = det.run_all_models(image)
            except Exception as e:
                self.stderr.write(f'  skipped {path}: {e}')
                continue
            scores = {r['model_name']: r.get('fake_prob') for r in results}
            row = {'path': path, 'label': label, **{m: scores.get(m) for m in models}}
            with open(path, 'rb') as fh:
                row['ai_label'] = check_provenance(fh.read())['ai_generated']
            for cid, loaded in candidates.items():
                row[cid] = self._score_candidate(loaded, image) if image is not None else None
            rows.append(row)
            if i % 25 == 0:
                self.stdout.write(f'  {i}/{len(files)} done')

        total = len(rows)
        self.stdout.write(f'\n{"":<{WIDTH}} {"scored":>9} {"acc@50":>6} {"fake%":>6} {"real%":>6} {"AUC":>6}')
        self.stdout.write('-' * (WIDTH + 86))

        hints = []
        for m in models:
            pairs = [(r['label'], r[m]) for r in rows if r[m] is not None]
            self.stdout.write(summarize(SHORT[m], pairs, total))
            a = auc(pairs)
            if a is not None and a < 0.60 and not small:
                hints.append(f'{SHORT[m]}: AUC {a * 100:.0f} is close to random - it is not helping.')
            if not pairs:
                hints.append(f'{SHORT[m]}: scored nothing - check the startup log for a load error.')
        for cid in candidates:
            pairs = [(r['label'], r[cid]) for r in rows if r[cid] is not None]
            self.stdout.write(summarize(f'candidate: {cid}', pairs, total))

        self.stdout.write('-' * (WIDTH + 86))
        working = [m for m in models if any(r[m] is not None for r in rows)]
        combos = [c for k in range(len(working), 1, -1) for c in itertools.combinations(working, k)]
        for combo in combos:
            pairs = [(r['label'], average(r, combo)) for r in rows if average(r, combo) is not None]
            self.stdout.write(summarize('Ensemble: ' + '+'.join(SHORT[m] for m in combo), pairs, total))
        others = [m for m in working if m != det.SIGLIP_NAME]
        for cid in candidates:  # candidate takes the SigLIP slot
            combo = [cid] + others
            pairs = [(r['label'], average(r, combo)) for r in rows if average(r, combo) is not None]
            self.stdout.write(summarize(f'Ensemble with candidate: {cid}', pairs, total))

        self.stdout.write(
            '\nacc@50 = accuracy with one cut-off at 50.  fake% / real% = share of fake / real files '
            'classified correctly.\nAUC = 50 is random, 100 is perfect.  "best thr" is tuned on this '
            'same set, so it is optimistic.')

        self._band_report(rows, working)
        for h in hints:
            self.stdout.write(h)

        columns = models + list(candidates)
        with open(opts['csv'], 'w', newline='', encoding='utf-8') as fh:
            w = csv.writer(fh)
            w.writerow(['file', 'label'] + [SHORT.get(c, c) for c in columns] + ['ai_label_in_file'])
            for r in rows:
                w.writerow([r['path'], 'fake' if r['label'] else 'real'] + [r[c] for c in columns]
                           + [r.get('ai_label', False)])
        self.stdout.write(f'Per-file scores written to {opts["csv"]}')

    def _band_report(self, rows, working):
        """What the app would actually show: metadata label first, then the ensemble."""
        cal = calibration.load()
        if cal:
            how = (f'calibrated weights from weights/calibration.json, REAL below {cal["real_below"]:g}, '
                   f'FAKE from {cal["fake_from"]:g} - optimistic if calibrated on this same set')
        else:
            how = f'plain average, REAL below {det.REAL_BELOW}, FAKE from {det.FAKE_FROM}'

        counts = {0: {'REAL': 0, 'UNCERTAIN': 0, 'FAKE': 0}, 1: {'REAL': 0, 'UNCERTAIN': 0, 'FAKE': 0}}
        labelled = {0: 0, 1: 0}
        for r in rows:
            if r.get('ai_label'):
                labelled[r['label']] += 1
                counts[r['label']]['FAKE'] += 1
                continue
            results = [{'model_name': m, 'fake_prob': r[m]} for m in working]
            v = det.compute_ensemble(results)['verdict']
            if v in counts[r['label']]:
                counts[r['label']][v] += 1

        self.stdout.write(f'\nWhat the app shows ({how}; otherwise UNCERTAIN -> expert):')
        for label, name, right, wrong in ((1, 'fake', 'FAKE', 'REAL'), (0, 'real', 'REAL', 'FAKE')):
            c = counts[label]
            self.stdout.write(f'  {name} files: {c[right]} labelled {right}, {c["UNCERTAIN"]} UNCERTAIN, '
                              f'{c[wrong]} wrongly labelled {wrong}')
        self.stdout.write(f'  AI label found in the file metadata: {labelled[1]} of the fakes, {labelled[0]} of the reals')

    def _load_candidates(self, ids):
        loaded = {}
        for cid in ids:
            self.stdout.write(f'Loading candidate {cid} ...')
            try:
                loaded[cid] = registry.load_hf_detector(cid)
            except Exception as e:
                self.stderr.write(f'  candidate skipped: {e}')
        return loaded

    def _score_candidate(self, loaded, image):
        model, processor, fake_index = loaded
        try:
            inputs = processor(images=image, return_tensors='pt').to(det.DEVICE)
            with torch.no_grad():
                probs = F.softmax(model(**inputs).logits, dim=1).squeeze().tolist()
            return round(probs[fake_index] * 100, 2)
        except Exception:
            return None
