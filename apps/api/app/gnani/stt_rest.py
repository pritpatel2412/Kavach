"""Prisma REST STT for enrollment liveness (not the realtime stream). Zero use in tests (monkeypatched)."""
from __future__ import annotations

import httpx

from .errors import GnaniError, hint_for
from .tts import _headers

STT_REST = "https://api.vachana.ai/stt/v3"


async def transcribe_file(api_key: str, audio: bytes, language_code: str,
                          filename: str = "speech.wav", timeout: float = 30.0) -> str:
    async with httpx.AsyncClient(timeout=timeout) as c:
        r = await c.post(
            STT_REST,
            headers=_headers(api_key),
            files={"audio_file": (filename, audio, "audio/wav")},
            data={"language_code": language_code},
        )
    if r.status_code != 200:
        raise GnaniError(r.status_code, r.text, hint_for(r.status_code))
    payload = r.json()
    return payload.get("transcript") or payload.get("text") or ""
