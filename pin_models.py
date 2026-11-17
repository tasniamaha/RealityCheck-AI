"""
Pins each Hugging Face model to the version already downloaded on this computer,
so an update by the model's owner cannot change results unnoticed.
Writes weights/hf_revisions.json (commit it so the whole team uses the same versions).
Run from the project folder:  python pin_models.py
"""
import json
import os

from transformers import AutoConfig

MODELS = [
    'prithivMLmods/deepfake-detector-model-v1',
    'Ateeqq/ai-vs-human-image-detector',
    'bendavidsteel/openfake-swinv2-base',
]
pins = {}
for name in MODELS:
    cfg = AutoConfig.from_pretrained(name)
    rev = getattr(cfg, '_commit_hash', None)
    if not rev:
        raise SystemExit(f'{name}: no version found. Start the server once so it downloads, then retry.')
    pins[name] = rev
    print(f'{name}: {rev}')
os.makedirs('weights', exist_ok=True)
with open(os.path.join('weights', 'hf_revisions.json'), 'w', encoding='utf-8') as fh:
    json.dump(pins, fh, indent=2)
print('Saved weights/hf_revisions.json')
