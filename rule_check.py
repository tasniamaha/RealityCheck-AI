"""
What the app labels on the 221-image test set, from eval_results.csv, for the
signals rule (OpenFake >= 50 or Xception >= 90) and the plain average.
Also writes the signals-rule numbers into the Methodology page.
Run from the project folder:  python rule_check.py
"""
import csv
import os
import re

rows = list(csv.DictReader(open('eval_results.csv', encoding='utf-8')))
models = [c for c in rows[0] if c not in ('file', 'label', 'ai_label_in_file')]
if 'OpenFake' not in models or 'Xception' not in models:
    raise SystemExit('eval_results.csv needs OpenFake and Xception columns. Re-run evaluate.')


def val(r, m):
    v = r.get(m, '')
    return float(v) if v not in ('', 'None') else None


def label(r, rule):
    if r.get('ai_label_in_file') == 'True':
        return 'FAKE'
    if rule == 'signals':
        of, xc = val(r, 'OpenFake'), val(r, 'Xception')
        return 'FAKE' if (of is not None and of >= 50) or (xc is not None and xc >= 90) else 'UNCERTAIN'
    vals = [val(r, m) for m in models if val(r, m) is not None]
    return 'FAKE' if vals and sum(vals) / len(vals) >= 50 else 'UNCERTAIN'


result = {}
for rule in ('signals', 'average'):
    c = {'fake': {'FAKE': 0, 'UNCERTAIN': 0}, 'real': {'FAKE': 0, 'UNCERTAIN': 0}}
    for r in rows:
        c[r['label']][label(r, rule)] += 1
    result[rule] = c
    print(f'{rule:8}  fakes: {c["fake"]["FAKE"]} FAKE / {c["fake"]["UNCERTAIN"]} UNCERTAIN    '
          f'reals: {c["real"]["UNCERTAIN"]} UNCERTAIN / {c["real"]["FAKE"]} wrongly FAKE')

c = result['signals']
meth = os.path.join('reality-check-frontend', 'src', 'pages', 'Methodology.jsx')
text = open(meth, encoding='utf-8').read()
new = ("const APP_LABELS = {\n"
       f"  fake: {{ right: {c['fake']['FAKE']}, unsure: {c['fake']['UNCERTAIN']}, wrong: 0 }},\n"
       f"  real: {{ right: 0, unsure: {c['real']['UNCERTAIN']}, wrong: {c['real']['FAKE']} }},\n"
       "};")
text, n = re.subn(r"const APP_LABELS = \{\n  fake: \{[^}]*\},\n  real: \{[^}]*\},\n\};", new, text)
text = text.replace('// Plain average of all five models; the app never labels a file REAL on its own.',
                    '// Signals rule (OpenFake >= 50 or Xception >= 90); the app never labels a file REAL on its own.')
open(meth, 'w', encoding='utf-8').write(text)
print('Methodology page updated with the signals-rule numbers.' if n else 'Methodology numbers not found - nothing changed.')
