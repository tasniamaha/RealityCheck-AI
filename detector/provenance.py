"""
provenance.py
--------------
Looks for an "AI-generated" label written into the file itself.

Many generators (ChatGPT / OpenAI API, Adobe Firefly, Google Imagen and others)
embed C2PA Content Credentials or IPTC metadata that declares the file as made
by a trained algorithm ("trainedAlgorithmicMedia"). When that label is present
the file is AI-generated (or AI-edited), whatever the detectors say.

Limits:
  - Midjourney and many open-source tools add no label.
  - Screenshots, re-saves and most social-media uploads strip the metadata.
  - The signature is not verified here, so a label could in theory be faked.
So a found label means FAKE; a missing label proves nothing.
"""

import re

# IPTC digital source types for generated or AI-edited media
# (trainedAlgorithmicMedia, compositeWithTrainedAlgorithmicMedia, compositeSynthetic, algorithmicMedia).
AI_SOURCE_TYPES = re.compile(rb'trainedAlgorithmicMedia|compositeSynthetic|algorithmicMedia', re.IGNORECASE)
C2PA_MARKERS = (b'c2pa', b'jumb')
ISSUERS = {
    b'OpenAI': 'OpenAI (ChatGPT / DALL-E / GPT Image)',
    b'Adobe Firefly': 'Adobe Firefly',
    b'Firefly': 'Adobe Firefly',
    b'Google': 'Google (Imagen / Gemini)',
    b'Microsoft': 'Microsoft (Designer / Bing Image Creator)',
    b'Stability': 'Stability AI',
    b'Meta': 'Meta AI',
}


def check_provenance(data: bytes) -> dict:
    """
    Returns {'has_credentials', 'ai_generated', 'issuer', 'note'}.
    note is a short sentence for the UI, or '' when nothing was found.
    """
    has_c2pa = all(m in data for m in C2PA_MARKERS)
    ai = AI_SOURCE_TYPES.search(data) is not None

    issuer = None
    if ai or has_c2pa:
        for key, name in ISSUERS.items():
            if key in data:
                issuer = name
                break

    if ai:
        who = f' by {issuer}' if issuer else ''
        note = (f'The file carries a label saying it was generated or edited by AI{who} '
                f'(Content Credentials / IPTC metadata, signature not verified).')
    elif has_c2pa:
        note = ('The file carries Content Credentials, but they do not declare AI generation. '
                'This is not proof the image is real.')
    else:
        note = ''
    return {'has_credentials': has_c2pa, 'ai_generated': ai, 'issuer': issuer, 'note': note}
