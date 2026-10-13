"""One live listening session: browser audio -> Prisma -> detector -> intervention + alerts -> browser."""
from __future__ import annotations

import asyncio
import json
import logging
import time

from fastapi import WebSocket, WebSocketDisconnect
from kavach_detector import RiskScorer

from .alerts import send_guardian_alert
from .config import Settings
from .gnani.mock_stt import MockStt
from .gnani.stt_stream import SttConnection, build_headers
from .interventions import InterventionManager

log = logging.getLogger("kavach.session")

# Boost words must be single, letters-only. Add Devanagari equivalents as you validate them (Phase 1).
DEFAULT_BIAS = ["CBI", "TRAI", "RBI", "Aadhaar", "warrant", "arrest", "verification", "transfer", "police"]
SILENCE_FRAME = bytes(1024)


class SessionRunner:
    def __init__(self, ws: WebSocket, settings: Settings, lang: str, sample_rate: int = 16000,
                 profile: str = "default"):
        self.ws, self.s, self.lang, self.rate = ws, settings, lang, sample_rate
        self.scorer = RiskScorer()
        self.interventions = InterventionManager(settings.clips_dir, lang, profile)
        self.playing = False
        self.gate_until = 0.0
        self.stt = self._make_stt()
        self.started = time.monotonic()
        self.last_alert_level = 0

    def _make_stt(self):
        if self.s.mock_stt:
            fixture = self.s.fixtures_dir / "transcripts" / "demo_scam_hinglish.json"
            return MockStt(fixture, self.s.mock_interval_s)
        if not self.s.gnani_api_key:
            raise RuntimeError("GNANI_API_KEY missing (or set KAVACH_MOCK_STT=1 for offline mode)")
        headers = build_headers(self.s.gnani_api_key, self.lang, sample_rate=self.rate,
                                bias_list=DEFAULT_BIAS, bias_score=1.0,
                                vad_threshold=self.s.stt_vad_threshold,
                                min_silence_ms=self.s.stt_min_silence_ms,
                                min_speech_ms=self.s.stt_min_speech_ms)
        return SttConnection(headers)

    async def send(self, obj: dict) -> None:
        await self.ws.send_text(json.dumps(obj, ensure_ascii=False))

    def gated(self) -> bool:
        return self.playing or time.monotonic() < self.gate_until

    async def _from_browser(self) -> None:
        try:
            while True:
                msg = await self.ws.receive()
                if msg.get("type") == "websocket.disconnect":
                    return
                if msg.get("bytes") is not None:
                    # FR-5 echo gate: while our own warning plays, feed SILENCE (keeps VAD cadence,
                    # prevents Kavach from transcribing itself).
                    await self.stt.send_audio(SILENCE_FRAME * (len(msg["bytes"]) // 1024 or 1)
                                              if self.gated() else msg["bytes"])
                elif msg.get("text"):
                    try:
                        data = json.loads(msg["text"])
                    except json.JSONDecodeError:
                        continue
                    t = data.get("type")
                    if t == "playback_start":
                        self.playing = True
                    elif t == "playback_end":
                        self.playing = False
                        self.gate_until = time.monotonic() + self.s.echo_gate_tail_s
                    elif t == "stop":
                        return
        except WebSocketDisconnect:
            return

    async def _from_stt(self) -> None:
        async for ev in self.stt.events():
            t = ev.get("type")
            if t == "transcript":
                if self.gated():       # belt and braces on top of silence feeding
                    continue
                await self._on_transcript(ev)
            elif t in ("connected", "processing", "error"):
                await self.send({"type": "stt_" + t, **{k: v for k, v in ev.items() if k != "type"}})
                if t == "error":
                    log.error("STT error: %s", ev.get("message"))

    async def _on_transcript(self, ev: dict) -> None:
        text = ev.get("text", "")
        idx = ev.get("segment_index", 0)
        up = self.scorer.update(text, idx)
        await self.send({"type": "transcript", "text": text, "segment_index": idx,
                         "latency_ms": ev.get("latency"), "audio_ms": ev.get("audio_duration_ms")})
        await self.send({"type": "risk", "score": up.score, "level": up.level, "stages": up.stages_seen,
                         "hits": [h[1] for h in up.hits], "segment_index": idx})
        payload = self.interventions.decide(up.level)
        if payload:
            payload["t_ms"] = int((time.monotonic() - self.started) * 1000)
            await self.send(payload)
        if up.level >= 2 and up.level > self.last_alert_level:
            self.last_alert_level = up.level
            ok = await send_guardian_alert(self.s.telegram_bot_token, self.s.telegram_chat_id,
                                           up.level, up.stages_seen, text)
            await self.send({"type": "alert_sent", "level": up.level, "delivered": ok})

    async def run(self) -> None:
        await self.stt.open()
        await self.send({"type": "state", "state": "listening", "lang": self.lang,
                         "mock": self.s.mock_stt})
        tasks = [asyncio.create_task(self._from_browser()), asyncio.create_task(self._from_stt())]
        try:
            done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
            for p in pending:
                p.cancel()
            for d in done:
                if d.exception():
                    log.error("session task failed: %r", d.exception())
        finally:
            await self.stt.close()
            try:
                await self.send({"type": "state", "state": "stopped", "max_score": self.scorer.max_score,
                                 "max_level": self.scorer.max_level})
            except Exception:
                pass
