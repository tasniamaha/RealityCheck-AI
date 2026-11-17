"""
AUC and accuracy per model, and for the average of all of them, from eval_results.csv.
Run from the project folder:  python summary.py
"""
import csv

with open('eval_results.csv', encoding='utf-8') as fh:
    rows = list(csv.DictReader(fh))
models = [c for c in rows[0] if c not in ('file', 'label', 'ai_label_in_file')]


def val(r, m):
    v = r.get(m, '')
    return float(v) if v not in ('', 'None') else None


def report(name, pairs):
    pos = [s for y, s in pairs if y]
    neg = [s for y, s in pairs if not y]
    if not pos or not neg:
        print(f'{name:<28} not enough scored files'); return
    wins = sum((p > n) + 0.5 * (p == n) for p in pos for n in neg)
    auc = 100 * wins / (len(pos) * len(neg))
    acc = 100 * sum((s >= 50) == y for y, s in pairs) / len(pairs)
    print(f'{name:<28} AUC {auc:5.1f}   accuracy {acc:5.1f}%   scored {len(pairs)}')


for m in models:
    report(m, [(r['label'] == 'fake', val(r, m)) for r in rows if val(r, m) is not None])

avg = []
for r in rows:
    vals = [val(r, m) for m in models if val(r, m) is not None]
    avg.append((r['label'] == 'fake', sum(vals) / len(vals) if vals else 50.0))
report('Average of all ' + str(len(models)), avg)
