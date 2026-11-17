"""
model_registry.py
------------------
Loads the detection models ONCE when Django starts.
Never call load_all_models() inside a request - only from apps.py ready().

A model that fails to load is left as None, so it is reported as an error
and excluded from the ensemble instead of silently running on random weights.
"""

import os
import torch
import torch.nn as nn

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# -- Globals --
SIGLIP_MODEL       = None
SIGLIP_PROCESSOR   = None
SIGLIP_FAKE_INDEX  = 0
XCEPTION_MODEL     = None
EFFICIENTNET_MODEL = None
AIHUMAN_MODEL      = None
AIHUMAN_PROCESSOR  = None
AIHUMAN_FAKE_INDEX = 0
OPENFAKE_MODEL     = None
OPENFAKE_PROCESSOR = None
OPENFAKE_FAKE_INDEX = 0
EXPERT_HEAD        = None   # set by detector.learning once experts have taught it
MODELS_LOADED      = False
LOAD_ERRORS        = {}

# The Hugging Face detector in the "SigLIP" slot. Override it by adding
# HF_DETECTOR_MODEL = '<model id>' to settings.py after `evaluate --candidate` shows a better one.
DEFAULT_HF_DETECTOR = 'prithivMLmods/deepfake-detector-model-v1'

# Third model: a SigLIP classifier fine-tuned on 60k AI-generated vs 60k human images
# (labels 'ai' / 'hum'). Override with THIRD_HF_DETECTOR_MODEL = '<model id>' in settings.py.
DEFAULT_THIRD_HF_DETECTOR = 'Ateeqq/ai-vs-human-image-detector'

# Fifth model: SwinV2 trained on the OpenFake dataset (modern AI-generated images).
# Override with OPENFAKE_DETECTOR_MODEL = '<model id>' in settings.py.
DEFAULT_OPENFAKE_DETECTOR = 'bendavidsteel/openfake-swinv2-base'

# Off: in evaluation Xception ranked below chance on AI-generated images
# (the checkpoint looks like a face-swap video model). Set True to load and use it again.
XCEPTION_ENABLED = True


# -- Xception --
# The checkpoint's keys are `base.0.*` and `h1.*`: a pytorchcv Xception backbone
# wrapped in an FCN with a BatchNorm/Linear head. The model must be built the
# same way or load_state_dict() fails.

class _XceptionHead(nn.Module):
    def __init__(self, in_f: int, out_f: int):
        super().__init__()
        self.f  = nn.Flatten()
        self.l  = nn.Linear(in_f, 512)
        self.d  = nn.Dropout(0.5)
        self.o  = nn.Linear(512, out_f)
        self.b1 = nn.BatchNorm1d(in_f)
        self.b2 = nn.BatchNorm1d(512)
        self.r  = nn.ReLU()

    def forward(self, x):
        x = self.d(self.b1(self.f(x)))
        x = self.d(self.b2(self.r(self.l(x))))
        return self.o(x)


class _XceptionFCN(nn.Module):
    def __init__(self, base: nn.Module, in_f: int):
        super().__init__()
        self.base = base
        self.h1   = _XceptionHead(in_f, 1)

    def forward(self, x):
        return self.h1(self.base(x))


def _build_xception() -> nn.Module:
    """Output: single logit -> sigmoid -> fake probability. Expects a face crop."""
    from pytorchcv.model_provider import get_model
    base = get_model('xception', pretrained=False)
    base = nn.Sequential(*list(base.children())[:-1])          # drop classifier
    base[0].final_block.pool = nn.Sequential(nn.AdaptiveAvgPool2d(1))
    return _XceptionFCN(base, 2048)


def _build_efficientnet() -> nn.Module:
    """EfficientNet-B0, 2-class head. index 0 = real, index 1 = fake."""
    from torchvision.models import efficientnet_b0
    model = efficientnet_b0(weights=None)   # checkpoint holds every layer
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(num_features, 2),
    )
    return model


def _load_checkpoint(model: nn.Module, path: str) -> nn.Module:
    """Strict load. Raises if the file is missing or the keys do not match."""
    if not os.path.exists(path):
        raise FileNotFoundError(f'weights not found at {path}')
    state = torch.load(path, map_location=DEVICE, weights_only=True)
    model.load_state_dict(state, strict=True)
    return model.to(DEVICE).eval()


FAKE_WORDS = {'fake', 'deepfake', 'ai', 'artificial', 'generated', 'synthetic', 'aigenerated', 'gan'}


def find_fake_index(id2label):
    """Which output index means 'fake / AI-generated'? Returns None if no label says so."""
    import re
    for idx, label in id2label.items():
        text = str(label).lower()
        words = set(re.split(r'[^a-z]+', text))
        if words & FAKE_WORDS or 'fake' in text or 'generat' in text or 'synth' in text:
            return int(idx)
    return None


def _revisions():
    import json
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'weights', 'hf_revisions.json')
    try:
        with open(path, encoding='utf-8') as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def load_hf_detector(name: str):
    """Load any 2-class Hugging Face image classifier. Returns (model, processor, fake_index)."""
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    revision = _revisions().get(name)          # pinned by pin_models.py, if present
    model = AutoModelForImageClassification.from_pretrained(name, revision=revision).to(DEVICE).eval()
    processor = AutoImageProcessor.from_pretrained(name, revision=revision)
    labels = model.config.id2label
    fake_index = find_fake_index(labels)
    if len(labels) != 2 or fake_index is None:
        raise ValueError(f'{name}: need 2 labels with one meaning fake/AI, got {dict(labels)}')
    return model, processor, fake_index


def _load_siglip():
    from django.conf import settings
    return load_hf_detector(getattr(settings, 'HF_DETECTOR_MODEL', DEFAULT_HF_DETECTOR))


def load_all_models():
    global SIGLIP_MODEL, SIGLIP_PROCESSOR, SIGLIP_FAKE_INDEX
    global XCEPTION_MODEL, EFFICIENTNET_MODEL, MODELS_LOADED
    global AIHUMAN_MODEL, AIHUMAN_PROCESSOR, AIHUMAN_FAKE_INDEX
    global OPENFAKE_MODEL, OPENFAKE_PROCESSOR, OPENFAKE_FAKE_INDEX

    if MODELS_LOADED:
        return

    from django.conf import settings

    print('[ModelRegistry] Loading Model 1 - Hugging Face detector...')
    try:
        SIGLIP_MODEL, SIGLIP_PROCESSOR, SIGLIP_FAKE_INDEX = _load_siglip()
        print(f'[ModelRegistry] OK SigLIP ready (fake index = {SIGLIP_FAKE_INDEX}).')
    except Exception as e:
        SIGLIP_MODEL = SIGLIP_PROCESSOR = None
        LOAD_ERRORS['siglip'] = str(e)
        print(f'[ModelRegistry] FAILED SigLIP failed: {e}')

    if XCEPTION_ENABLED:
        print('[ModelRegistry] Loading Model 2 - Xception...')
        try:
            XCEPTION_MODEL = _load_checkpoint(_build_xception(), str(settings.XCEPTION_WEIGHTS))
            print('[ModelRegistry] OK Xception ready.')
        except Exception as e:
            XCEPTION_MODEL = None
            LOAD_ERRORS['xception'] = str(e)
            print(f'[ModelRegistry] FAILED Xception failed: {e}')
    else:
        print('[ModelRegistry] Model 2 - Xception is disabled (XCEPTION_ENABLED = False).')

    print('[ModelRegistry] Loading Model 3 - EfficientNet-B0 (Custom)...')
    try:
        EFFICIENTNET_MODEL = _load_checkpoint(_build_efficientnet(), str(settings.EFFICIENTNET_WEIGHTS))
        print('[ModelRegistry] OK EfficientNet ready.')
    except Exception as e:
        EFFICIENTNET_MODEL = None
        LOAD_ERRORS['efficientnet'] = str(e)
        print(f'[ModelRegistry] FAILED EfficientNet failed: {e}')

    third = getattr(settings, 'THIRD_HF_DETECTOR_MODEL', DEFAULT_THIRD_HF_DETECTOR)
    print(f'[ModelRegistry] Loading AI-vs-Human detector ({third})...')
    try:
        AIHUMAN_MODEL, AIHUMAN_PROCESSOR, AIHUMAN_FAKE_INDEX = load_hf_detector(third)
        print(f'[ModelRegistry] OK AI-vs-Human ready (fake index = {AIHUMAN_FAKE_INDEX}).')
    except Exception as e:
        AIHUMAN_MODEL = AIHUMAN_PROCESSOR = None
        LOAD_ERRORS['aihuman'] = str(e)
        print(f'[ModelRegistry] FAILED AI-vs-Human failed: {e}')

    openfake = getattr(settings, 'OPENFAKE_DETECTOR_MODEL', DEFAULT_OPENFAKE_DETECTOR)
    print(f'[ModelRegistry] Loading OpenFake detector ({openfake})...')
    try:
        OPENFAKE_MODEL, OPENFAKE_PROCESSOR, OPENFAKE_FAKE_INDEX = load_hf_detector(openfake)
        print(f'[ModelRegistry] OK OpenFake ready (fake index = {OPENFAKE_FAKE_INDEX}).')
    except Exception as e:
        OPENFAKE_MODEL = OPENFAKE_PROCESSOR = None
        LOAD_ERRORS['openfake'] = str(e)
        print(f'[ModelRegistry] FAILED OpenFake failed: {e}')

    from detector import learning
    learning.load_head()

    MODELS_LOADED = True
    loaded = sum(m is not None for m in (SIGLIP_MODEL, XCEPTION_MODEL, EFFICIENTNET_MODEL, AIHUMAN_MODEL, OPENFAKE_MODEL))
    wanted = 5 if XCEPTION_ENABLED else 4
    print(f'[ModelRegistry] {loaded}/{wanted} models loaded. Running on: {DEVICE.upper()}')
