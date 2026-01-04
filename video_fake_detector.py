import os
import cv2
import torch
from PIL import Image
from transformers import AutoImageProcessor, SiglipForImageClassification

# =========================
# CONFIG
# =========================
VIDEO_PATH = r"D:\RealityCheck\detector\assets\videos\newreporter_real(labebel fakes).mp4"
BASE_DIR = r"D:\RealityCheck\detector"
FRAMES_DIR = os.path.join(BASE_DIR, "frames_all")
UNCERTAIN_DIR = os.path.join(BASE_DIR, "frames_uncertain")

FRAME_SKIP = 3

FAKE_THRESHOLD = 0.70   # > 70% → FAKE
REAL_THRESHOLD = 0.30   # < 30% → REAL
# between → UNCERTAIN

os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(UNCERTAIN_DIR, exist_ok=True)

# =========================
# LOAD MODEL
# =========================
print("[INFO] Loading model...")
MODEL_NAME = "prithivMLmods/deepfake-detector-model-v1"
model = SiglipForImageClassification.from_pretrained(MODEL_NAME)
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model.eval()

# =========================
# READ VIDEO
# =========================
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise RuntimeError("❌ Could not open video file")

frame_index = 0

fake_frames = 0
real_frames = 0
uncertain_frames = 0

uncertain_images = []

print("[INFO] Processing frames...")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_index += 1
    if frame_index % FRAME_SKIP != 0:
        continue

    frame_path = os.path.join(FRAMES_DIR, f"frame_{frame_index:05d}.jpg")
    cv2.imwrite(frame_path, frame)

    image = Image.open(frame_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)[0]

    fake_prob = probs[0].item()
    real_prob = probs[1].item()

    # =========================
    # DECISION LOGIC
    # =========================
    if fake_prob > FAKE_THRESHOLD:
        verdict = "FAKE"
        fake_frames += 1

    elif fake_prob < REAL_THRESHOLD:
        verdict = "REAL"
        real_frames += 1

    else:
        verdict = "UNCERTAIN"
        uncertain_frames += 1

        uncertain_path = os.path.join(
            UNCERTAIN_DIR, f"uncertain_{frame_index:05d}.jpg"
        )
        cv2.imwrite(uncertain_path, frame)
        uncertain_images.append(uncertain_path)

    if frame_index % 50 == 0:
        print(f"Processed frame {frame_index}")

cap.release()

# =========================
# SUMMARY
# =========================
print("\n==============================")
print("📊 FRAME-LEVEL SUMMARY")
print("==============================")
print(f"FAKE frames      : {fake_frames}")
print(f"REAL frames      : {real_frames}")
print(f"UNCERTAIN frames : {uncertain_frames}")

# =========================
# FINAL VERDICT (SAFE LOGIC)
# =========================
if fake_frames > real_frames and fake_frames > uncertain_frames:
    final_verdict = "🔴 VIDEO IS LIKELY FAKE"
elif real_frames > fake_frames and real_frames > uncertain_frames:
    final_verdict = "🟢 VIDEO IS LIKELY REAL"
else:
    final_verdict = "🟡 VIDEO IS UNCERTAIN (Human Review Needed)"

print("\nFINAL VERDICT:")
print(final_verdict)

# =========================
# OPEN UNCERTAIN FRAMES
# =========================
if uncertain_images:
    print("\n[INFO] Opening UNCERTAIN frames for review...")
    for img in uncertain_images[:10]:  # open first 10 only
        os.startfile(img)

print("\n✅ Done.")
