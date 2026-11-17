# Reality Check

Reality Check is a deepfake and AI-image checker with a human in the loop. Five detectors score each upload. An AI label written into the file overrides them. Clear results are decided by the AI straight away. Unsure files, and any result a user complains about, go to a verified human expert.

Built by Noshin Syara, Tasnia Rahman Maha and Maliha Mehnaj.

## How it works

1. **Upload.** A logged-in user uploads an image or a video (JPG, PNG, WEBP, MOV and similar formats).
2. **Detectors.** Each model gives a fake score from 0 to 100:
   - SigLIP deepfake detector (`prithivMLmods/deepfake-detector-model-v1`, public)
   - Xception (FaceForensics++ face-swap checkpoint). It scores only the face, which is found with the YuNet face detector.
   - EfficientNet-B0 (our model, re-trained on DeepFakeFace with `train_efficientnet.py`)
   - AI-vs-Human SigLIP (`Ateeqq/ai-vs-human-image-detector`, public)
   - OpenFake SwinV2 (`bendavidsteel/openfake-swinv2-base`, public, trained on recent AI image generators)
   - Videos are scored frame by frame.
3. **Decision.** Each model decides only on the job it was built for:
   - FAKE when OpenFake scores 50% or more (AI-generated image), or Xception scores 90% or more (face swap).
   - REAL only when every model that scored the file is below 20%, and none failed to run.
   - Anything in between is UNSURE and goes to an expert.

   The other three models are shown with their explanations, and the average of all five is shown for reference. To use the average instead, set `ENSEMBLE_RULE = 'average'` in `deepfake_backend/settings.py`. To never let the AI say REAL, set `AI_AUTO_REAL_BELOW = None`. If a model fails to load, the result page says which one.
4. **Provenance.** If the file carries an AI label in its metadata (C2PA or IPTC "trained algorithmic media"), it is marked FAKE. The signature is not verified.
5. **Explanations.** Each model's card says, in plain words:
   - how sure it is
   - what it was trained on
   - where in the picture its decision came from, using a heatmap
   - how the models that check the same thing scored it
   - how often it was right on our test set

   No language model writes these explanations. The heatmaps come from Grad-CAM for EfficientNet, gradient x activation for the SigLIP models, and blurring one patch at a time for Xception and OpenFake.
6. **Expert review.** An approved expert reviews the unsure files. The models never outvote the expert. A FAKE verdict needs a written reason.
7. **Learning from experts.** Once experts have marked at least 50 images fake for the same reason, and at least 50 images real, an admin can train an extra "Expert-trained" detector on their reviews, from the admin dashboard or with `python manage.py learn`. It goes live only if it does better on the test set. It never changes the AI label rule by itself: new weights are saved as `weights/calibration.proposed.json` for the team to review.
8. **Complaints.** A user who disagrees with any result, from the AI or an expert, can complain. The file goes back to the expert queue with the complaint and the disputed verdict, and the complaint is closed when an expert reviews it.

## Measured accuracy

Measured on 221 labelled images (110 real, 111 fake):
- 200 images from DeepFakeFace that were not used for training: 100 real photos, 34 text-to-image, 33 inpainting and 33 face swaps
- 21 images the team collected

| Detector | AUC | Accuracy at 50 |
|---|---|---|
| SigLIP | 55.3 | 52.0% |
| Xception | 55.8 | 55.7% |
| EfficientNet-B0 (re-trained) | 62.6 | 60.2% |
| AI-vs-Human | 65.7 | 64.3% |
| OpenFake SwinV2 | 82.4 | 75.6% |

AUC 50 means guessing and 100 means perfect.

What the app decides on its own, and how many files go to an expert: run `python rule_check.py` to see it. The Methodology page shows the same numbers.

Four more test sets of 100 fakes and 100 real photos each (fakes caught / real photos wrongly flagged):

| Rule | AI images (OpenFake) | AI images (DeepFakeFace) | Face swaps (tuning) | Face swaps (held back) |
|---|---|---|---|---|
| OpenFake or Xception (used) | 100 / 2 | 94 / 11 | 27 / 8 | 25 / 5 |
| Average of all five | 87 / 5 | 92 / 3 | 13 / 13 | 19 / 7 |

The 90% Xception line was chosen after seeing these results, so the held-back face-swap set is the fair comparison. These sets contain photos only; screenshots, memes and infographics were not tested.

Known weak spots:
- OpenFake is strong on fully AI-made pictures but almost never spots face swaps. Xception covers some of those.
- EfficientNet and AI-vs-Human scored 8 of the team's 10 real phone photos as fake.
- EfficientNet was re-trained on DeepFakeFace, so its numbers on this mostly-DeepFakeFace test set are likely optimistic.

To measure again:

```powershell
python manage.py evaluate testset --csv eval_results.csv
python breakdown.py
python summary.py
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

The first start downloads the three Hugging Face models (about 1.2 GB) and then loads every model, which takes a minute. If the download hangs, run `$env:HF_HUB_DISABLE_XET = "1"` in the same terminal before starting the server.

Experts register at `/expert-register`. An admin approves them from the admin dashboard.

## Useful commands

| Command | What it does |
|---|---|
| `python manage.py evaluate testset` | Scores every model and the AI label on the test set |
| `python manage.py evaluate testset --candidate <hf-model-id>` | Tries another Hugging Face detector before you switch to it |
| `python manage.py calibrate` | Learns weights for the models; saves them only if they beat the plain average |
| `python manage.py learn` / `learn --status` | Runs or checks learning from expert reviews |
| `python sample_dff.py` | Downloads DeepFakeFace (about 5 GB, to `D:\DeepFakeFace`) and adds a sample to the test set |
| `python train_efficientnet.py` | Re-trains EfficientNet-B0 on DeepFakeFace, leaving test-set photos out |
| `python breakdown.py` | Shows results by kind of image, from `eval_results.csv` |
| `python summary.py` | AUC and accuracy per model and for the average, from `eval_results.csv` |
| `python rule_check.py` | What the app decides on its own on the test set, and how many files go to an expert |
| `python pin_models.py` | Pins each Hugging Face model to the version you have, in `weights/hf_revisions.json` |

## Security

- **Uploads and scans:** uploads need a login. Users only see their own scans; experts and admins see all of them.
- **Failed logins:** limited to 5 tries per username and address, followed by a 5-minute lock.
- **Login:** a wrong username and a wrong password get the same message, so the login page never reveals who has an account.
- **Sign-up:** "username taken" is checked as you type, limited to 60 checks a minute per address. Emails are checked only when you submit, with a neutral message.
- **Before you deploy,** set these environment variables:
  - `DJANGO_SECRET_KEY`: a long random string
  - `DJANGO_DEBUG=0`
  - `DJANGO_ALLOWED_HOSTS`: your domain
- **Uploaded files:** serve `media/` through your web server with access control.
- **Cross-site requests:** the JSON API still skips Django's CSRF check. The `SameSite=Lax` login cookie blocks cross-site POSTs, but turn CSRF on before a public launch.
- **The database:** `db.sqlite3` holds user accounts and is not in git. Each person creates their own with `migrate` and `createsuperuser`.

## Limitations

- Accuracy is modest (see above). Treat a model score as a hint, not proof.
- DeepFakeFace uses 2023 generators: Stable Diffusion 1.5, SD inpainting and InsightFace. Newer generators may score differently.
- The AI-label check reads the metadata but does not verify the C2PA signature. Stripping the metadata removes the label.
- The demo page plays a scripted example; it does not run the models.

## Credits

- DeepFakeFace dataset: Song et al., *Robustness and Generalizability of Deepfake Detection: A Study with Diffusion Models*, 2023 (arXiv:2309.02218). The real photos come from IMDB-WIKI and are for research use only.
- The detector checkpoints belong to their Hugging Face authors.
