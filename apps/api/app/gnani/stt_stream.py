"""Prisma realtime STT client (raw WebSocket; the Python SDK does not expose VAD headers).

Verified against docs.gnani.ai/api/STT/stt-websocket (see docs/GNANI_API_NOTES.md):
- config is passed as upgrade HEADERS; browsers cannot set them -> we proxy.
- binary frames must be EXACTLY 1024 bytes (512 samples of PCM16 mono) at real-time cadence.
- session hard cap 15 min -> we roll the connection at 14:30.
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
import unicodedata
from typing import AsyncIterator

import websockets

log = logging.getLogger("kavach.stt")

STT_URL = "wss://api.vachana.ai/stt/v3/stream"
FRAME_BYTES = 1024
ROLL_AT_S = 14 * 60 + 30
ALLOWED_BIAS_SCORES = {0.0, 0.5, 1.0, 1.5, 2.0}


def sanitize_bias_list(words: list[str], limit: int = 100) -> list[str]:
    """Gnani silently ignores the WHOLE list if any entry is invalid -> filter strictly.

    Valid: single word, letters only (Latin or Indic; Unicode categories L* and M*), no digits/punct.
    """
    out, seen = [], set()
    for w in words:
        w = w.strip()
        if not w or w.lower() in seen:
            continue
        if all(unicodedata.category(c)[0] in ("L", "M") for c in w):
            seen.add(w.lower())
            out.append(w)
        if len(out) >= limit:
            break
    return out


def build_headers(api_key: str, lang_code: str, *, sample_rate: int = 16000, fmt: str = "verbatim",
                  bias_list: list[str] | None = None, bias_score: float = 1.0,
                  vad_threshold: float | None = None, min_silence_ms: int | None = None,
                  min_speech_ms: int | None = None, min_segment_ms: int | None = None,
                  max_speech_s: float | None = None) -> dict[str, str]:
    if sample_rate not in (8000, 16000, 44100, 48000):
        raise ValueError("sample_rate must be 8000, 16000, 44100 or 48000")
    h = {"x-api-key-id": api_key, "lang_code": lang_code, "x-sample-rate": str(sample_rate), "x-format": fmt}
    words = sanitize_bias_list(bias_list or [])
    if words:
        if bias_score not in ALLOWED_BIAS_SCORES:
            raise ValueError(f"bias_score must be one of {sorted(ALLOWED_BIAS_SCORES)}")
        h["x-bias-list"] = json.dumps(words)   # ensure_ascii=True -> \uXXXX, header-safe
        h["x-bias-score"] = str(bias_score)
    for name, val in (("x-vad-threshold", vad_threshold), ("x-min-silence-ms", min_silence_ms),
                      ("x-min-speech-ms", min_speech_ms), ("x-min-segment-ms", min_segment_ms),
                      ("x-max-speech-s", max_speech_s)):
        if val is not None:
            h[name] = str(val)
    return h


class SttConnection:
    def __init__(self, headers: dict[str, str]):
        self.headers = headers
        self.ws = None
        self.started = 0.0
        self._buf = bytearray()
        self._closing = False

    @property
    def age(self) -> float:
        return time.monotonic() - self.started if self.started else 0.0

    async def open(self) -> None:
        self.ws = await websockets.connect(STT_URL, additional_headers=self.headers, ping_interval=20)
        self.started = time.monotonic()
        log.info("Prisma STT connected")

    async def send_audio(self, chunk: bytes) -> None:
        """Buffer arbitrary-size PCM and emit exact 1024-byte frames."""
        self._buf.extend(chunk)
        while len(self._buf) >= FRAME_BYTES:
            frame = bytes(self._buf[:FRAME_BYTES])
            del self._buf[:FRAME_BYTES]
            if self.ws is not None:
                try:
                    await self.ws.send(frame)
                except websockets.ConnectionClosed:
                    log.warning("send on closed STT socket (will reconnect in reader)")

    async def roll(self) -> None:
        """Open a fresh connection before the 15-min cap, then close the old one."""
        new = await websockets.connect(STT_URL, additional_headers=self.headers, ping_interval=20)
        old, self.ws, self.started = self.ws, new, time.monotonic()
        log.info("Prisma STT session rolled")
        if old is not None:
            await old.close()

    async def events(self) -> AsyncIterator[dict]:
        while not self._closing:
            try:
                raw = await asyncio.wait_for(self.ws.recv(), timeout=1.0)
            except asyncio.TimeoutError:
                if self.age > ROLL_AT_S:
                    await self.roll()
                continue
            except websockets.ConnectionClosed:
                if self._closing:
                    return
                log.warning("STT socket closed unexpectedly; reconnecting")
                await self.open()
                continue
            if isinstance(raw, bytes):
                continue
            try:
                yield json.loads(raw)
            except json.JSONDecodeError:
                log.warning("non-JSON STT message: %r", raw[:100])

    async def close(self) -> None:
        self._closing = True
        if self.ws is not None:
            await self.ws.close()
