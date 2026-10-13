"""Timbre TTS + voice cloning over REST (httpx). Auth header: X-API-Key-ID.

Docs: /api/v1/tts/inference (timbre-v2.5 or vachana-vc-v1 + speaker_embedding),
      /api/v1/tts/voice-clone/embeddings (multipart audio_file, 5-30 s).
Write numbers as spoken words in text (Input Formatting Guide) or they get mispronounced.
"""
from __future__ import annotations

import httpx

from .errors import GnaniError, hint_for

BASE = "https://api.vachana.ai"


def _headers(api_key: str) -> dict[str, str]:
    return {"X-API-Key-ID": api_key}


def _check(r: httpx.Response) -> None:
    if r.status_code != 200:
        raise GnaniError(r.status_code, r.text, hint_for(r.status_code))


async def synthesize(api_key: str, text: str, *, voice: str, language: str = "hi-IN", speed: float = 1.0,
                     sample_rate: int = 48000, container: str = "wav", timeout: float = 30.0) -> bytes:
    """Timbre v2.5. For telephony test audio use container='mulaw' (forced 8 kHz)."""
    audio_config: dict = {"sample_rate": sample_rate, "num_channels": 1, "sample_width": 2,
                          "encoding": "linear_pcm", "container": container}
    if container in ("mulaw", "alaw", "mp3", "ogg"):
        audio_config.pop("encoding")
    body = {"text": text, "voice": voice, "model": "timbre-v2.5", "language": language,
            "speed": speed, "audio_config": audio_config}
    async with httpx.AsyncClient(timeout=timeout) as c:
        r = await c.post(f"{BASE}/api/v1/tts/inference", json=body, headers=_headers(api_key))
    _check(r)
    return r.content


def normalise_embedding(payload: dict) -> dict:
    """Docs show two shapes: {embedding,shape,dtype} and {data:{voice_clone_embedding:{...}}}."""
    if "data" in payload and isinstance(payload["data"], dict):
        payload = payload["data"].get("voice_clone_embedding", payload["data"])
    if not all(k in payload for k in ("embedding", "shape", "dtype")):
        raise ValueError(f"unexpected embedding response keys: {list(payload)}")
    return {"embedding": payload["embedding"], "shape": payload["shape"], "dtype": payload["dtype"]}


async def create_embedding(api_key: str, audio: bytes, filename: str = "reference.wav",
                           timeout: float = 60.0) -> dict:
    async with httpx.AsyncClient(timeout=timeout) as c:
        r = await c.post(f"{BASE}/api/v1/tts/voice-clone/embeddings", headers=_headers(api_key),
                         files={"audio_file": (filename, audio, "audio/wav")})
    _check(r)
    return normalise_embedding(r.json())


async def synthesize_cloned(api_key: str, text: str, embedding: dict, *, sample_rate: int = 44100,
                            timeout: float = 60.0) -> bytes:
    body = {"text": text, "model": "vachana-vc-v1", "speaker_embedding": embedding,
            "audio_config": {"sample_rate": sample_rate, "num_channels": 1, "sample_width": 2,
                             "encoding": "linear_pcm", "container": "wav"}}
    async with httpx.AsyncClient(timeout=timeout) as c:
        r = await c.post(f"{BASE}/api/v1/tts/inference", json=body, headers=_headers(api_key))
    _check(r)
    return r.content
