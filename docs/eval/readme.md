# Evaluation results

Date: 2026-11-17
Test set: 100 real + 100 fake images from DeepFakeFace (OpenRL, Hugging Face).
Real = `wiki.zip`, fake = `insight.zip` (InsightFace face swaps).
Sampled with `tools/sample_images.py`, seed 42. Images are not in this repo.

| Run | Faces found | Xception AUC | 3-model ensemble AUC |
|---|---|---|---|
| Haar face detector (`faceswap_dff_report.txt`) | 129/200 | 67.5 | 55.4 |
| YuNet face detector (`faceswap_dff_report_yunet.txt`) | 197/200 | 70.4 | 60.8 |
| YuNet, tuning sample, seed 7 (`faceswap_tune_scores.csv`) | 198/200 | 62.5 | 63.6 |
SigLIP (AUC 47.2) and EfficientNet (AUC 49.7) are at chance level on face swaps.
Across both samples (400 images) Xception's AUC is about 66 (95% range 61-71).
The two samples do not overlap. Thresholds were not changed after these runs.
## Setup needed to reproduce
Download `face_detection_yunet_2023mar.onnx` from
https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
and save it in `weights/`.