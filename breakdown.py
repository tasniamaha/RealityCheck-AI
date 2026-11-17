"""
Break eval_results.csv down by kind of image.
Shows, per model, the average fake score and how many files score 50 or more.
Run from the project folder after `python manage.py evaluate testset`.
"""
import csv
import os
import sys

path = sys.argv[1] if len(sys.argv) > 1 else 'eval_results.csv'
with open(path, encoding='utf-8') as fh:
    rows = list(csv.DictReader(fh))
models = [c for c in rows[0] if c not in ('file', 'label', 'ai_label_in_file')]


def group(row):
    name = os.path.basename(row['file'])
    for kind in ('wiki', 'text2img', 'inpainting', 'insight'):
        if name.startswith(f'dff_{kind}_'):
            return {'wiki': 'DFF real photos', 'text2img': 'DFF text-to-image',
                    'inpainting': 'DFF inpainting', 'insight': 'DFF face swap'}[kind]
    return 'Your own ' + row['label'] + ' images'


groups = {}
for r in rows:
    groups.setdefault(group(r), []).append(r)

print(f'{"":26}' + ''.join(f'{m[:22]:>24}' for m in models))
print('-' * (26 + 24 * len(models)))
for g in sorted(groups):
    items = groups[g]
    cells = []
    for m in models:
        vals = [float(r[m]) for r in items if r[m] not in ('', 'None')]
        hi = sum(v >= 50 for v in vals)
        cells.append(f'avg {sum(vals) / max(len(vals), 1):5.1f}  {hi:3d}/{len(vals):<3d} >=50')
    print(f'{g + f" ({len(items)})":26}' + ''.join(f'{c:>24}' for c in cells))
print('\nFor real images ">=50" counts mistakes; for fakes it counts hits.')
