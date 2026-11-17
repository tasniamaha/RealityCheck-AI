"""
Re-train the EfficientNet-B0 detector on DeepFakeFace images.

Uses the four zips that sample_dff.py downloaded to ZIP_DIR. Images already in
testset/ are left out, and so is every other version of the same photo (the
DFF fakes are made from the wiki photos), so the test stays fair.

Starts from the current EfficientNet weights, trains for a few epochs on the
CPU, keeps the epoch with the best validation AUC and saves it as
weights/efficientnet_dff.pt. The old weights file is not touched.

Run from the project folder:  python train_efficientnet.py
"""
import io
import os
import random
import sys
import time
import zipfile

import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from torchvision.models import efficientnet_b0

ZIP_DIR = r'D:\DeepFakeFace'
OLD_WEIGHTS = os.path.join('weights', 'best_model-v3.pt')
NEW_WEIGHTS = os.path.join('weights', 'efficientnet_dff.pt')
PLAN = [('wiki.zip', 0, 1500), ('text2img.zip', 1, 500), ('inpainting.zip', 1, 500), ('insight.zip', 1, 500)]
IMAGE_EXTS = ('.jpg', '.jpeg', '.png', '.webp')
EPOCHS = int(os.environ.get('EPOCHS', 4))
BATCH = 32
VAL_SHARE = 0.15
SEED = 42

torch.manual_seed(SEED)
torch.set_num_threads(max(1, os.cpu_count() or 1))


def photo_key(member):
    """'wiki/00/123_x.jpg' -> '00/123_x': the same key for a real photo and its fakes."""
    parts = member.replace('\\', '/').split('/')
    return os.path.splitext('/'.join(parts[1:]))[0].lower()


def test_keys():
    """Keys of every DFF photo that is in the test set, in any version."""
    keys = set()
    for name, label, _ in PLAN:
        folder = os.path.join('testset', 'fake' if label else 'real')
        prefix = 'dff_' + name.replace('.zip', '') + '_'
        in_test = {f for f in os.listdir(folder) if f.startswith(prefix)}
        if not in_test:
            continue
        with zipfile.ZipFile(os.path.join(ZIP_DIR, name)) as z:
            for m in z.namelist():
                if prefix + m.replace('/', '_').replace('\\', '_') in in_test:
                    keys.add(photo_key(m))
    return keys


def load_samples():
    skip = test_keys()
    print(f'{len(skip)} photos are in the test set and are left out of training')
    samples = []                     # (raw bytes, label)
    for name, label, count in PLAN:
        path = os.path.join(ZIP_DIR, name)
        if not os.path.exists(path):
            sys.exit(f'{path} not found. Run sample_dff.py first.')
        with zipfile.ZipFile(path) as z:
            members = sorted(m for m in z.namelist()
                             if m.lower().endswith(IMAGE_EXTS) and photo_key(m) not in skip)
            random.Random(SEED + 1).shuffle(members)
            for m in members[:count]:
                samples.append((z.read(m), label))
        print(f'  {name}: {min(count, len(members))} images')
    return samples


class RandomJpeg:
    """Re-save as JPEG at a random quality, so file format and compression are no clue."""
    def __call__(self, img):
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=random.randint(60, 95))
        buf.seek(0)
        return Image.open(buf).convert('RGB')


NORMALIZE = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
TRAIN_TF = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0), ratio=(0.9, 1.1)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.1, 0.1, 0.1),
    RandomJpeg(),
    transforms.ToTensor(),
    NORMALIZE,
])
EVAL_TF = transforms.Compose([      # the same as the app uses
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    NORMALIZE,
])


class Bytes(torch.utils.data.Dataset):
    def __init__(self, items, tf):
        self.items, self.tf = items, tf

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        data, label = self.items[i]
        return self.tf(Image.open(io.BytesIO(data)).convert('RGB')), label


def build_model():
    model = efficientnet_b0(weights=None)
    model.classifier = nn.Sequential(nn.Dropout(0.4), nn.Linear(model.classifier[1].in_features, 2))
    model.load_state_dict(torch.load(OLD_WEIGHTS, map_location='cpu', weights_only=True), strict=True)
    for block in model.features[:5]:            # keep the early layers as they are
        for p in block.parameters():
            p.requires_grad = False
    return model


def auc(scores, labels):
    scores, labels = np.asarray(scores), np.asarray(labels)
    pos, neg = scores[labels == 1], scores[labels == 0]
    if len(pos) == 0 or len(neg) == 0:
        return float('nan')
    wins = (pos[:, None] > neg[None, :]).sum() + 0.5 * (pos[:, None] == neg[None, :]).sum()
    return 100.0 * wins / (len(pos) * len(neg))


def evaluate(model, loader):
    model.eval()
    scores, labels = [], []
    with torch.no_grad():
        for x, y in loader:
            scores += torch.softmax(model(x), dim=1)[:, 1].tolist()
            labels += y.tolist()
    acc = 100.0 * np.mean((np.array(scores) >= 0.5) == np.array(labels))
    return auc(scores, labels), acc


def main():
    if not os.path.isdir('testset') or not os.path.exists(OLD_WEIGHTS):
        sys.exit('Run this from the project folder (it needs testset/ and weights/best_model-v3.pt).')
    samples = load_samples()
    random.Random(SEED).shuffle(samples)
    n_val = int(len(samples) * VAL_SHARE)
    val, train = samples[:n_val], samples[n_val:]
    print(f'Training on {len(train)} images, checking on {len(val)}')

    train_loader = torch.utils.data.DataLoader(Bytes(train, TRAIN_TF), batch_size=BATCH, shuffle=True)
    val_loader = torch.utils.data.DataLoader(Bytes(val, EVAL_TF), batch_size=BATCH)

    model = build_model()
    v_auc, v_acc = evaluate(model, val_loader)
    print(f'Before training: validation AUC {v_auc:.1f}, accuracy {v_acc:.1f}')
    best = v_auc

    params = [p for p in model.parameters() if p.requires_grad]
    opt = torch.optim.AdamW(params, lr=3e-4, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=EPOCHS * len(train_loader))
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(1, EPOCHS + 1):
        model.train()
        for block in model.features[:5]:
            block.eval()                         # frozen layers keep their BatchNorm stats
        start, total = time.time(), 0.0
        for i, (x, y) in enumerate(train_loader, 1):
            opt.zero_grad()
            loss = loss_fn(model(x), y)
            loss.backward()
            opt.step()
            sched.step()
            total += loss.item()
            if i == 5 and epoch == 1:
                per_epoch = (time.time() - start) / 5 * len(train_loader)
                print(f'  about {per_epoch / 60:.0f} min per epoch, {EPOCHS} epochs')
        v_auc, v_acc = evaluate(model, val_loader)
        mark = ''
        if v_auc > best:
            best = v_auc
            torch.save(model.state_dict(), NEW_WEIGHTS)
            mark = '  saved'
        print(f'Epoch {epoch}: loss {total / len(train_loader):.3f}, '
              f'validation AUC {v_auc:.1f}, accuracy {v_acc:.1f}{mark}')

    if os.path.exists(NEW_WEIGHTS):
        print(f'Best validation AUC {best:.1f}. Weights in {NEW_WEIGHTS}')
    else:
        print('Training did not beat the old weights; nothing saved.')


if __name__ == '__main__':
    main()
