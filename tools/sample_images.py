import random, shutil, sys, pathlib
src, dst, n = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), int(sys.argv[3])
seed = int(sys.argv[4]) if len(sys.argv) > 4 else 42
exclude = pathlib.Path(sys.argv[5]) if len(sys.argv) > 5 else None

skip = {p.name.split("_", 1)[1] for p in exclude.iterdir()} if exclude else set()
random.seed(seed)
files = sorted(p for p in src.rglob("*")
               if p.suffix.lower() in {".jpg", ".jpeg", ".png"} and p.name not in skip)
dst.mkdir(parents=True, exist_ok=True)
for i, p in enumerate(random.sample(files, n)):
    shutil.copy(p, dst / f"{i:03d}_{p.name}")