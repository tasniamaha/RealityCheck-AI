import random, shutil, sys, pathlib
src, dst, n = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), int(sys.argv[3])
random.seed(42)
files = sorted(p for p in src.rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
dst.mkdir(parents=True, exist_ok=True)
for i, p in enumerate(random.sample(files, n)):
    shutil.copy(p, dst / f"{i:03d}_{p.name}")