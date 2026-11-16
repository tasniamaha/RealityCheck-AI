r"""
Builds an AI-generated test set from OpenFake (Hugging Face: ComplexDataLab/OpenFake).

Streams the official test split, so the full dataset is NOT downloaded.
Saves the original image files unchanged (no re-compression).

Usage:
    python tools\sample_openfake.py testset\aigen 100
    python tools\sample_openfake.py testset\aigen_tune 100 7      (different seed)
"""
import io
import sys
import pathlib
from collections import Counter

from datasets import load_dataset, Image as HFImage
from PIL import Image

out      = pathlib.Path(sys.argv[1])
per_cls  = int(sys.argv[2]) if len(sys.argv) > 2 else 100
seed     = int(sys.argv[3]) if len(sys.argv) > 3 else 42
MAX_PER_GENERATOR = 5        # keeps the fake class spread over many generators
MAX_ROWS_SCANNED  = 20000    # safety stop

ds = load_dataset("ComplexDataLab/OpenFake", "core", split="test", streaming=True)
ds = ds.cast_column("image", HFImage(decode=False))   # keep the original file bytes
ds = ds.shuffle(seed=seed, buffer_size=300)

for cls in ("real", "fake"):
    (out / cls).mkdir(parents=True, exist_ok=True)

saved, per_gen, manifest = Counter(), Counter(), []
for scanned, row in enumerate(ds, 1):
    label = str(row["label"]).strip().lower()
    gen = str(row.get("model") or "unknown")
    if label not in ("real", "fake") or saved[label] >= per_cls:
        pass
    elif label == "fake" and per_gen[gen] >= MAX_PER_GENERATOR:
        pass
    else:
        data = row["image"].get("bytes")
        if data:
            try:
                ext = (Image.open(io.BytesIO(data)).format or "PNG").lower().replace("jpeg", "jpg")
            except Exception:
                ext = None
            if ext:
                name = f"{saved[label]:03d}_{gen.replace('/', '-').replace(' ', '_')}.{ext}"
                (out / label / name).write_bytes(data)
                manifest.append(f"{label},{name},{gen},{row.get('row_id', '')}")
                saved[label] += 1
                if label == "fake":
                    per_gen[gen] += 1
    if scanned % 200 == 0:
        print(f"  scanned {scanned} rows - saved {saved['real']} real, {saved['fake']} fake")
    if saved["real"] >= per_cls and saved["fake"] >= per_cls:
        break
    if scanned >= MAX_ROWS_SCANNED:
        print("Stopped at the safety limit before the set was complete.")
        break

(out / "manifest.csv").write_text("label,file,generator,row_id\n" + "\n".join(manifest), encoding="utf-8")
print(f"Done: {saved['real']} real, {saved['fake']} fake in {out}")
print("Fake images per generator:", dict(per_gen.most_common()))