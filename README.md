# Reality Check

Reality Check is a deepfake and AI-image checker with a human in the loop. Three detectors score each upload. An AI label written into the file overrides them. A verified expert then gives the final verdict, and users can dispute it.

Built by Noshin Syara, Tasnia Rahman Maha and Maliha Mehnaj.

## How it works

1. **Upload.** A logged-in user uploads an image or a video (JPG, PNG, WEBP, MP4, MOV and similar formats).
2. **Detectors.** Each model gives a fake score from 0 to 100:
   - SigLIP deepfake detector (`prithivMLmods/deepfake-detector-model-v1`, public)
   - EfficientNet-B0 (our model, re-trained on DeepFakeFace with `train_efficientnet.py`)
   - AI-vs-Human SigLIP (`Ateeqq/ai-vs-human-image-detector`, public)
   - Videos are scored frame by frame.
3. **Ensemble.** The scores are combined using weights learned from the labelled test set (`weights/calibration.json`). The result is FAKE, REAL or UNCERTAIN.
4. **Provenance.** If the file carries an AI label in its metadata (C2PA or IPTC "trained algorithmic media"), it is marked FAKE. The signature is not verified.
5. **Explanations.** Each model's explanation is built from its stored score and a heatmap (Grad-CAM for EfficientNet, gradient x activation for SigLIP). No language model writes them.
6. **Expert verdict.** An approved expert reviews the file and decides. The models never outvote the expert. A FAKE verdict needs a written reason.
7. **Learning from experts.** Once experts have marked at least 50 images fake for the same reason, and at least 50 images real, the system trains an extra "Expert-trained" detector on their reviews and re-learns the ensemble weights. The new version goes live only if it does better on the test set. Admins can see its progress on their dashboard.
8. **Complaints.** A user can dispute a verdict. Admins resolve or dismiss complaints.

## Measured accuracy

Measured on 221 labelled images (110 real, 111 fake):
- 200 images from DeepFakeFace that were not used for training: 100 real photos, 34 text-to-image, 33 inpainting and 33 face swaps
- 21 images the team collected

| Detector | AUC | Accuracy at 50 |
|---|---|---|
| SigLIP | 55.3 | 52.0% |
| EfficientNet-B0 (re-trained) | 62.6 | 60.2% |
| AI-vs-Human | 65.7 | 64.3% |
| Average of all three | 68.9 | 66.5% |

AUC 50 means guessing and 100 means perfect.

With the calibrated ensemble, the app labels 72 of the 221 images on its own and gets 47 of those right. It sends the other 149 to an expert as UNCERTAIN.

The detectors do best on fully generated images and worst on face swaps. On the team's own 10 real photos, two of the three detectors scored 8 as fake.

These detectors cannot decide alone, which is why an expert always gives the final verdict.

To measure again:

```powershell
python manage.py evaluate testset --csv eval_results.csv
python breakdown.py
python manage.py calibrate
```

`testset/real` and `testset/fake` are not in git. `sample_dff.py` fills them from DeepFakeFace.

## Running it on Windows

You need Python 3.12+ and Node 20+.

```powershell
# backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser      # your admin account
python manage.py runserver

# frontend, in a second terminal
cd reality-check-frontend
npm install
npm run dev
```

Open http://localhost:5173.

The first start downloads the two Hugging Face models (about 1 GB) and then loads every model, which takes a minute. If the download hangs, run `$env:HF_HUB_DISABLE_XET = "1"` in the same terminal before starting the server.

Experts register at `/expert-register`. An admin approves them from the admin dashboard.

## Useful commands

| Command | What it does |
|---|---|
| `python manage.py evaluate testset` | Scores every model and the ensemble on the test set |
| `python manage.py evaluate testset --candidate <hf-model-id>` | Tries another Hugging Face detector before you switch to it |
| `python manage.py calibrate` | Re-learns the ensemble weights; saves them only if they beat the plain average |
| `python manage.py learn` / `learn --status` | Runs or checks learning from expert reviews |
| `python sample_dff.py` | Downloads DeepFakeFace (about 5 GB, to `D:\DeepFakeFace`) and adds a sample to the test set |
| `python train_efficientnet.py` | Re-trains EfficientNet-B0 on DeepFakeFace, leaving test-set photos out |
| `python breakdown.py` | Shows results by kind of image, from `eval_results.csv` |

## Settings for a real server

The defaults are for running on your own computer. Before you deploy, set these environment variables:

- `DJANGO_SECRET_KEY`: a long random string
- `DJANGO_DEBUG=0`
- `DJANGO_ALLOWED_HOSTS`: your domain

Also serve `media/` through your web server with access control, because uploaded files are personal data.

`db.sqlite3` holds user accounts and is not in git. Each person creates their own with `migrate` and `createsuperuser`.

## Project layout

```
deepfake_backend/     Django settings and root URLs
detector/
  model_registry.py   loads the models once at start-up
  image_detector.py   runs the detectors and the ensemble
  video_detector.py   frame sampling for videos
  provenance.py       C2PA / IPTC AI-label check
  calibration.py      ensemble weights
  explain.py          per-model explanations and heatmaps
  learning.py         learning from expert reviews
  views.py, urls.py   upload, auth, expert, admin and complaint APIs
  management/commands evaluate, calibrate, learn
weights/              model weights and calibration.json
reality-check-frontend/  React + Vite + Tailwind app
```

## Limitations

- Accuracy is modest (see above). Treat a model score as a hint, not proof.
- DeepFakeFace uses 2023 generators: Stable Diffusion 1.5, SD inpainting and InsightFace. Newer generators may score differently.
- The AI-label check reads the metadata but does not verify the C2PA signature. Stripping the metadata removes the label.
- The Xception model is switched off because it scored below chance on AI-generated images.
- The demo page plays a scripted example; it does not run the models.

## Credits

- DeepFakeFace dataset: Song et al., *Robustness and Generalizability of Deepfake Detection: A Study with Diffusion Models*, 2023 (arXiv:2309.02218). The real photos come from IMDB-WIKI and are for research use only.
- The detector checkpoints belong to their Hugging Face authors.
