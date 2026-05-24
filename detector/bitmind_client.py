"""
bitmind_client.py
------------------
Client for the BitMind Deepfake Detection API.

Standard API : https://api.bitmind.ai
Enterprise   : https://enterprise.bitmind.ai

Docs reference:
  POST /api/v1/detect          — image detection
  POST /api/v1/detect/video    — video detection
  GET  /api/v1/health          — health check

Authentication: Bearer token in Authorization header.
"""

import os
import base64
import requests
from typing import Dict, Any, Optional

# ── Base URLs ──────────────────────────────────────────────────────────────────
STANDARD_BASE_URL   = 'https://api.bitmind.ai'
ENTERPRISE_BASE_URL = 'https://enterprise.bitmind.ai'


class BitMindClient:
    """
    Wraps both the standard and enterprise BitMind APIs.
    Automatically falls back to standard if enterprise key not set.
    """

    def __init__(self, api_key: Optional[str] = None, use_enterprise: bool = False):
        self.api_key      = api_key or os.environ.get('BITMIND_API_KEY', '')
        self.base_url     = ENTERPRISE_BASE_URL if use_enterprise else STANDARD_BASE_URL
        self.use_enterprise = use_enterprise
        self.timeout      = 60  # seconds

        if not self.api_key:
            print('[BitMindClient] WARNING: No API key set. '
                  'Set BITMIND_API_KEY in environment or settings.py.')

    @property
    def _headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type':  'application/json',
        }

    def _post(self, endpoint: str, payload: Dict) -> Dict[str, Any]:
        url = f'{self.base_url}{endpoint}'
        try:
            resp = requests.post(
                url,
                json=payload,
                headers=self._headers,
                timeout=self.timeout,
            )
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response else 'unknown'
            detail = ''
            try:
                detail = e.response.json().get('detail', e.response.text[:200])
            except Exception:
                pass
            return {
                'error': f'BitMind API HTTP {status}: {detail}',
                'status_code': status,
            }
        except requests.exceptions.ConnectionError:
            return {'error': f'Cannot connect to BitMind API at {url}. Check network / API URL.'}
        except requests.exceptions.Timeout:
            return {'error': f'BitMind API request timed out after {self.timeout}s.'}
        except Exception as e:
            return {'error': f'BitMind API unexpected error: {str(e)}'}

    # ── Public methods ─────────────────────────────────────────────────────────

    def health_check(self) -> Dict[str, Any]:
        """GET /api/v1/health"""
        url = f'{self.base_url}/api/v1/health'
        try:
            resp = requests.get(url, headers=self._headers, timeout=10)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            return {'status': 'error', 'detail': str(e)}

    def detect_image(self, image_bytes: bytes, filename: str = 'image.jpg') -> Dict[str, Any]:
        """
        POST /api/v1/detect
        Sends image as base64.
        Returns normalized result:
          {
            model_name: 'BitMind API',
            fake_prob:  float (0-100),
            real_prob:  float (0-100),
            verdict:    'FAKE' | 'REAL' | 'UNCERTAIN' | 'ERROR',
            raw:        <original API response>
          }
        """
        b64 = base64.b64encode(image_bytes).decode('utf-8')
        payload = {
            'image':    b64,
            'filename': filename,
        }
        raw = self._post('/api/v1/detect', payload)
        return self._normalize(raw)

    def detect_video(self, video_bytes: bytes, filename: str = 'video.mp4') -> Dict[str, Any]:
        """
        POST /api/v1/detect/video
        Sends video as base64.
        """
        b64 = base64.b64encode(video_bytes).decode('utf-8')
        payload = {
            'video':    b64,
            'filename': filename,
        }
        raw = self._post('/api/v1/detect/video', payload)
        return self._normalize(raw)

    def _normalize(self, raw: Dict) -> Dict[str, Any]:
        """
        Normalize the BitMind API response into the same shape
        the rest of the project uses:
          { model_name, fake_prob, real_prob, verdict, raw }

        BitMind returns something like:
          { "is_fake": true/false, "confidence": 0.87, "score": 0.87 }
        OR
          { "fake_probability": 0.87, "real_probability": 0.13 }

        We handle both shapes + fall back gracefully.
        """
        if 'error' in raw:
            return {
                'model_name': 'BitMind API',
                'fake_prob':  None,
                'real_prob':  None,
                'verdict':    'ERROR',
                'error':      raw['error'],
                'raw':        raw,
            }

        # Shape 1: fake_probability / real_probability
        if 'fake_probability' in raw:
            fake_prob = float(raw['fake_probability']) * 100
            real_prob = float(raw.get('real_probability', 1 - raw['fake_probability'])) * 100

        # Shape 2: confidence + is_fake flag
        elif 'confidence' in raw and 'is_fake' in raw:
            confidence = float(raw['confidence']) * 100
            is_fake    = bool(raw['is_fake'])
            fake_prob  = confidence if is_fake else (100 - confidence)
            real_prob  = 100 - fake_prob

        # Shape 3: score only
        elif 'score' in raw:
            fake_prob = float(raw['score']) * 100
            real_prob = 100 - fake_prob

        else:
            # Unknown shape — return raw so developer can inspect
            return {
                'model_name': 'BitMind API',
                'fake_prob':  None,
                'real_prob':  None,
                'verdict':    'ERROR',
                'error':      f'Unrecognized API response shape: {list(raw.keys())}',
                'raw':        raw,
            }

        fake_prob = round(fake_prob, 2)
        real_prob = round(real_prob, 2)

        if fake_prob >= 50:
            verdict = 'FAKE'
        elif fake_prob >= 35:
            verdict = 'UNCERTAIN'
        else:
            verdict = 'REAL'

        return {
            'model_name': 'BitMind API',
            'fake_prob':  fake_prob,
            'real_prob':  real_prob,
            'verdict':    verdict,
            'raw':        raw,
        }