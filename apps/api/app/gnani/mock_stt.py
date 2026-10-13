"""Offline stand-in for Prisma so UI + detector + intervention can be built with ZERO credits.

Enable with KAVACH_MOCK_STT=1. Emits scripted transcript segments from fixtures/transcripts/*.json.
"""
from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import AsyncIterator


class MockStt:
    def __init__(self, fixture: Path, interval_s: float = 4.0):
        self.segments = json.loads(fixture.read_text(encoding="utf-8"))["segments"]
        self.interval_s = interval_s
        self._closing = False

    async def open(self) -> None:
        return None

    async def send_audio(self, chunk: bytes) -> None:  # audio is ignored in mock mode
        return None

    async def events(self) -> AsyncIterator[dict]:
        now = lambda: datetime.now(timezone.utc).isoformat()
        yield {"type": "connected", "message": "MOCK STT", "timestamp": now(), "config": {"sample_rate": 16000}}
        for i, seg in enumerate(self.segments):
            if self._closing:
                return
            await asyncio.sleep(self.interval_s)
            yield {"type": "processing", "timestamp": now()}
            yield {"type": "transcript", "timestamp": now(), "text": seg["text"], "segment_index": i,
                   "segment_id": f"mock-{i}", "audio_duration_ms": 2500, "latency": 300}

    async def close(self) -> None:
        self._closing = True
