from transformers import AutoImageProcessor, SiglipForImageClassification
from PIL import Image
import torch

# --- 1) Load the pretrained model from Hugging Face ---
model_name = "prithivMLmods/deepfake-detector-model-v1"

print(f"Loading model '{model_name}'…")
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)

id2label = model.config.id2label  # e.g., {0: "fake", 1: "real"}

# --- 2) Function to run inference ---
def detect_ai_generated(image_path: str):
    # Load and preprocess image
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    # Run the model without gradient tracking (fast and less memory)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    # Convert raw outputs (logits) into probabilities
    probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

    # Print results
    print("\nPrediction probabilities:")
    for idx, prob in enumerate(probs):
        label = id2label[idx]  # <-- fix: use integer keys
        print(f"  {label}: {prob*100:.2f}%")

    # Pick highest-confidence label
    best_idx = int(torch.argmax(logits, dim=1).item())
    best_label = id2label[best_idx]  # <-- fix: use integer keys
    print(f"\n➡️ Result: {best_label.upper()} image")

# --- 3) Run on an image ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print(r"Usage: python detect_ai_image.py <D:\RealityCheck\detector\assets\image\sample.jpg>")
    else:
        img_path = sys.argv[1]
        detect_ai_generated(img_path)
