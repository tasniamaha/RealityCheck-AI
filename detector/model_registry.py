"""
model_registry.py
------------------
Loads all three detection models ONCE when Django starts.
Import SIGLIP_MODEL, XCEPTION_MODEL, EFFICIENTNET_MODEL from here.
Never call load_all_models() inside a request — only from apps.py ready().
"""

import os
import torch
import torch.nn as nn

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# ── Globals ───────────────────────────────────────────────────────────────────
SIGLIP_MODEL       = None
SIGLIP_PROCESSOR   = None
XCEPTION_MODEL     = None
EFFICIENTNET_MODEL = None
MODELS_LOADED      = False


def _build_xception() -> nn.Module:
    """
    Xception from pytorchcv with a single linear head for binary classification.
    Output: single logit → sigmoid → fake probability.
    """
    from pytorchcv.model_provider import get_model
    base = get_model('xception', pretrained=False)
    in_features = base.output.in_channels if hasattr(base.output, 'in_channels') else 2048
    base.output = nn.Linear(in_features, 1)
    return base


def _build_efficientnet() -> nn.Module:
    """
    EfficientNet-B0 with custom head matching training setup in export_to_pt.py.
    Output: 2-class softmax → index 0 = real, index 1 = fake.
    """
    from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(num_features, 2)
    )
    return model


def load_all_models():
    global SIGLIP_MODEL, SIGLIP_PROCESSOR, XCEPTION_MODEL, EFFICIENTNET_MODEL, MODELS_LOADED

    if MODELS_LOADED:
        return

    from django.conf import settings
    from transformers import AutoImageProcessor, SiglipForImageClassification

    # ── Model 1: SigLIP ───────────────────────────────────────────────────────
    print('[ModelRegistry] Loading Model 1 — SigLIP (HuggingFace)...')
    try:
        SIGLIP_MODEL = SiglipForImageClassification.from_pretrained(
            'prithivMLmods/deepfake-detector-model-v1'
        )
        SIGLIP_PROCESSOR = AutoImageProcessor.from_pretrained(
            'prithivMLmods/deepfake-detector-model-v1'
        )
        SIGLIP_MODEL.eval()
        print('[ModelRegistry] ✓ SigLIP ready.')
    except Exception as e:
        print(f'[ModelRegistry] ✗ SigLIP failed: {e}')

    # ── Model 2: Xception ─────────────────────────────────────────────────────
    print('[ModelRegistry] Loading Model 2 — Xception-FaceForensics...')
    try:
        XCEPTION_MODEL = _build_xception()
        w = str(settings.XCEPTION_WEIGHTS)
        if os.path.exists(w):
            XCEPTION_MODEL.load_state_dict(torch.load(w, map_location=DEVICE))
            print(f'[ModelRegistry] ✓ Xception weights loaded from {w}')
        else:
            print(f'[ModelRegistry] ⚠ Xception weights not found at {w} — using random weights')
        XCEPTION_MODEL.to(DEVICE)
        XCEPTION_MODEL.eval()
    except Exception as e:
        print(f'[ModelRegistry] ✗ Xception failed: {e}')

    # ── Model 3: EfficientNet-B0 ──────────────────────────────────────────────
    print('[ModelRegistry] Loading Model 3 — EfficientNet-B0 (Custom)...')
    try:
        EFFICIENTNET_MODEL = _build_efficientnet()
        w = str(settings.EFFICIENTNET_WEIGHTS)
        if os.path.exists(w):
            EFFICIENTNET_MODEL.load_state_dict(torch.load(w, map_location=DEVICE))
            print(f'[ModelRegistry] ✓ EfficientNet weights loaded from {w}')
        else:
            print(f'[ModelRegistry] ⚠ EfficientNet weights not found at {w} — using random weights')
        EFFICIENTNET_MODEL.to(DEVICE)
        EFFICIENTNET_MODEL.eval()
    except Exception as e:
        print(f'[ModelRegistry] ✗ EfficientNet failed: {e}')

    MODELS_LOADED = True
    print(f'[ModelRegistry] ✅ All models loaded. Running on: {DEVICE.upper()}')