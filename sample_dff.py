"""
Copy a random sample of the DeepFakeFace dataset into testset/.

    real : wiki.zip        (real photos from IMDB-WIKI)
    fake : text2img.zip    (Stable Diffusion 1.5)
           inpainting.zip  (Stable Diffusion inpainting: part of a real face replaced)
           insight.zip     (InsightFace face swap)

Each zip holds 30,000 images and is downloaded once to ZIP_DIR, outside the
project so it never ends up in git. Only the sampled images are extracted.
Run from the project folder. Running it again adds no duplicates.
"""
import os
import random
import sys
import zipfile

ZIP_DIR = r'D:\DeepFakeFace'
REPO = 'OpenRL/DeepFakeFace'
PLAN = [                       # (zip, testset folder, how many)
    ('wiki.zip',       'real', 100),
    ('text2img.zip',   'fake', 34),
    ('inpainting.zip', 'fake', 33),
    ('insight.zip',    'fake', 33),
]
IMAGE_EXTS = ('.jpg', '.jpeg', '.png', '.webp')


def get_zip(name):
    path = os.path.join(ZIP_DIR, name)
    if os.path.exists(path):
        return path
    from huggingface_hub import hf_hub_download
    print(f'Downloading {name} (large, this can take a while)...')
    return hf_hub_download(repo_id=REPO, repo_type='dataset', filename=name, local_dir=ZIP_DIR)


if not os.path.isdir('testset'):
    sys.exit('Run this from the project folder (the one that contains testset).')
os.makedirs(ZIP_DIR, exist_ok=True)

for name, label, count in PLAN:
    zpath = get_zip(name)
    prefix = 'dff_' + name.replace('.zip', '') + '_'
    out_dir = os.path.join('testset', label)
    os.makedirs(out_dir, exist_ok=True)
    existing = [f for f in os.listdir(out_dir) if f.startswith(prefix)]
    if len(existing) >= count:
        print(f'{name}: already have {len(existing)} in testset/{label}')
        continue
    with zipfile.ZipFile(zpath) as z:
        members = sorted(m for m in z.namelist() if m.lower().endswith(IMAGE_EXTS))
        random.Random(42).shuffle(members)
        written = len(existing)
        for m in members:
            if written >= count:
                break
            dest = os.path.join(out_dir, prefix + m.replace('/', '_').replace('\\', '_'))
            if os.path.exists(dest):
                continue
            with z.open(m) as src, open(dest, 'wb') as dst:
                dst.write(src.read())
            written += 1
    print(f'{name}: {written} images in testset/{label}')

for label in ('real', 'fake'):
    print(f'testset/{label}: {len(os.listdir(os.path.join("testset", label)))} files in total')
