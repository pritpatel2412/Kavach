"""One live listening session: browser audio -> Prisma -> detector -> intervention + alerts -> browser."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import time
import wave
from pathlib import Path

from fastapi import WebSocket, WebSocketDisconnect
from kavach_detector import RiskScorer, format_reason, level_for

from . import db
from .alerts import send_guardian_alert
from .config import Settings
from .gnani.mock_stt import MockStt
from .gnani.stt_stream import SttConnection, build_headers
from .interventions import InterventionManager
from .llm import blend_score, second_opinion
from .signed_token import create_action_token

log = logging.getLogger("kavach.session")

active_sessions: dict[str, SessionRunner] = {}

DEFAULT_BIAS = ["CBI", "TRAI", "RBI", "Aadhaar", "warrant", "arrest", "verification", "transfer", "police"]
SILENCE_FRAME = bytes(1024)
FRAME_BYTES = 1024


def gated_audio(chunk: bytes, gated: bool) -> bytes:
    """FR-5 echo gate: substitute silence while our warning plays (keeps VAD cadence)."""
    if not gated:
        return chunk
    n = max(1, len(chunk) // FRAME_BYTES)
    return SILENCE_FRAME * n


def load_pcm16_mono(path: Path, target_rate: int = 16000) -> bytes:
    import array
    with wave.open(str(path), "rb") as w:
        nch, sw, rate, nframes, *_ = w.getparams()
        raw = w.readframes(nframes)
    if not raw or len(raw) == 0:
        raise ValueError("Replay WAV file is empty (zero frames)")
    if sw != 2:
        raise ValueError("replay wav must be 16-bit PCM")
    if nch == 2:
        pcm = bytearray()
        for i in range(0, len(raw), 4):
            pcm.extend(raw[i:i + 2])
        raw = bytes(pcm)
    src_check = array.array("h")
    src_check.frombytes(raw)
    if not any(abs(s) > 10 for s in src_check):
        raise ValueError("Replay WAV file is completely silent (no audio amplitude)")
    if rate == target_rate:
        return raw
    # linear resample of int16 mono
    import array
    src = array.array("h")
    src.frombytes(raw)
    ratio = rate / target_rate
    n_out = int(len(src) / ratio)
    out = array.array("h", [0] * n_out)
    for i in range(n_out):
        x = i * ratio
        j = int(x)
        if j + 1 >= len(src):
            out[i] = src[-1]
        else:
            frac = x - j
            out[i] = int(src[j] * (1 - frac) + src[j + 1] * frac)
    return out.tobytes()


class SessionRunner:
    def __init__(self, ws: WebSocket, settings: Settings, lang: str, sample_rate: int = 16000,
                 profile: str = "default", elder_id: str | None = None, replay: str | None = None):
        self.ws, self.s, self.lang, self.rate = ws, settings, lang, sample_rate
        self.elder_id = elder_id or None
        self.replay = replay or None
        self.elder = db.get_elder(self.elder_id) if self.elder_id else None
        if self.elder and not lang:
            self.lang = self.elder["language"]
        vp = db.voice_profile_for_elder(self.elder_id) if self.elder_id else None
        self.profile = vp["id"] if vp else profile
        self.scorer = RiskScorer()
        elder_name = self.elder["name"] if self.elder else "आप"
        guardian_name = "Kavach"
        gender = "m"
        if self.elder:
            g = db.get_guardian(self.elder["guardian_id"])
            if g:
                guardian_name = g.get("name", "Kavach")
                gender = g.get("gender", "m")
        self.interventions = InterventionManager(
            settings.clips_dir, self.lang, self.profile,
            elder_name=elder_name, guardian_name=guardian_name, gender=gender,
        )
        self.playing = False
        self.gate_until = 0.0
        self.stt = self._make_stt()
        self.started = time.monotonic()
        self.last_alert_level = 0
        self.session_id = ""
        self._speech_end_mono = 0.0
        self._recent_texts: list[str] = []
        self._stop = False
        self.guardian_connected = False
        self._fallback_task: asyncio.Task | None = None

    def _make_stt(self):
        if self.s.mock_stt:
            name = (self.replay or "demo_scam_hinglish.wav").rsplit(".", 1)[0]
            fixture = self.s.fixtures_dir / "transcripts" / f"{name}.json"
            if not fixture.is_file():
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
            while not self._stop:
                msg = await self.ws.receive()
                if msg.get("type") == "websocket.disconnect":
                    return
                if msg.get("bytes") is not None:
                    if self.replay:
                        continue  # file replay owns the audio
                    await self.stt.send_audio(gated_audio(msg["bytes"], self.gated()))
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
                    elif t == "heartbeat":
                        db.update_heartbeat(self.session_id)
                    elif t == "stop":
                        return
        except WebSocketDisconnect:
            return

    async def _replay_wav(self) -> None:
        path = self.s.fixtures_dir / "audio" / self.replay
        if not path.is_file():
            log.warning("replay file missing: %s", path)
            return
        try:
            pcm = load_pcm16_mono(path, 16000)
        except Exception as e:
            log.warning("replay wav unreadable: %s", e)
            return
        pace = FRAME_BYTES / (16000 * 2)  # 32 ms
        for i in range(0, len(pcm), FRAME_BYTES):
            if self._stop:
                return
            frame = pcm[i:i + FRAME_BYTES]
            if len(frame) < FRAME_BYTES:
                frame = frame + bytes(FRAME_BYTES - len(frame))
            await self.stt.send_audio(gated_audio(frame, self.gated()))
            await asyncio.sleep(pace)

    async def _from_stt(self) -> None:
        async for ev in self.stt.events():
            t = ev.get("type")
            if t == "transcript":
                if self.gated():
                    continue
                if not self._speech_end_mono:
                    self._speech_end_mono = time.monotonic()
                await self._on_transcript(ev)
            elif t in ("connected", "processing", "error"):
                if t == "processing":
                    self._speech_end_mono = time.monotonic()
                await self.send({"type": "stt_" + t, **{k: v for k, v in ev.items() if k != "type"}})
                if t == "error":
                    log.error("STT error: %s", ev.get("message"))

    async def _wait_and_play_fallback(self, payload: dict, timeout_s: float = 20.0) -> None:
        try:
            await asyncio.sleep(timeout_s)
            if not self.guardian_connected and not self._stop:
                log.info("L3 alert: guardian did not join intercom within 20s; playing cloned warning clip")
                await self.send(payload)
        except asyncio.CancelledError:
            log.info("L3 fallback clip cancelled because guardian joined intercom")

    def guardian_joined_intercom(self) -> None:
        self.guardian_connected = True
        if self._fallback_task and not self._fallback_task.done():
            self._fallback_task.cancel()

    async def relay_intercom_audio(self, pcm_bytes: bytes) -> None:
        import base64
        # S3-F: Intercom playback must activate the echo gate (silence substitution + tail)
        # 16 kHz 16-bit mono = 32,000 bytes/sec
        duration_s = len(pcm_bytes) / 32000.0
        self.gate_until = max(self.gate_until, time.monotonic() + duration_s + self.s.echo_gate_tail_s)
        b64 = base64.b64encode(pcm_bytes).decode("ascii")
        await self.send({"type": "intercom_audio", "audio": b64, "rate": 16000})

    async def _on_transcript(self, ev: dict) -> None:
        text = ev.get("text", "")
        idx = ev.get("segment_index", 0)
        up = self.scorer.update(text, idx)
        score, level = up.score, up.level
        self._recent_texts.append(text)
        if self.s.llm_provider:
            opinion = await second_opinion(
                self._recent_texts, [h[1] for h in up.hits], up.score, provider=self.s.llm_provider,
                api_key=self.s.llm_api_key)
            if opinion:
                score = blend_score(up.score, opinion)
                level = level_for(score, up.s1_s5_together)
                self.scorer.level = max(self.scorer.level, level)
                self.scorer.max_level = max(self.scorer.max_level, level)
                self.scorer.max_score = max(self.scorer.max_score, score)
        reason_en = format_reason(up.stages_seen, "en")
        reason_hi = format_reason(up.stages_seen, "hi")
        await self.send({"type": "transcript", "text": text, "segment_index": idx,
                         "latency_ms": ev.get("latency"), "audio_ms": ev.get("audio_duration_ms")})
        await self.send({"type": "risk", "score": score, "level": level, "stages": up.stages_seen,
                         "hits": [h[1] for h in up.hits], "segment_index": idx,
                         "session_id": self.session_id, "reason_en": reason_en, "reason_hi": reason_hi})
        try:
            db.insert_event(self.session_id, idx, text[:160], up.stages_seen, score, level,
                            reason_en=reason_en, reason_hi=reason_hi)
            db.touch_session_scores(self.session_id, score, level)
        except Exception as e:
            log.warning("session persist failed: %s", e)
        payload = self.interventions.decide(level)
        if payload:
            speech_end = self._speech_end_mono or time.monotonic()
            payload["ttw_ms"] = int((time.monotonic() - speech_end) * 1000)
            payload["t_ms"] = int((time.monotonic() - self.started) * 1000)
            payload["reason_en"] = reason_en
            payload["reason_hi"] = reason_hi
            if level == 3 and payload.get("clip_url"):
                if self.guardian_connected:
                    log.info("L3 alert: guardian already on intercom, clip deferred")
                else:
                    if self._fallback_task and not self._fallback_task.done():
                        self._fallback_task.cancel()
                    timeout_s = float(os.getenv("L3_FALLBACK_TIMEOUT_S", "0.05" if self.s.mock_stt else "20.0"))
                    self._fallback_task = asyncio.create_task(self._wait_and_play_fallback(payload, timeout_s))
            else:
                await self.send(payload)
        self._speech_end_mono = 0.0
        if level >= 2 and level > self.last_alert_level:
            self.last_alert_level = level
            chat_id = self.s.telegram_chat_id
            elder_name = "your family member"
            if self.elder:
                elder_name = self.elder["name"]
                g = db.get_guardian(self.elder["guardian_id"])
                if g and g.get("telegram_chat_id"):
                    chat_id = g["telegram_chat_id"]
            timeline = f"{self.s.public_url}/timeline.html?session={self.session_id}"
            action_token = create_action_token(self.session_id, purpose="alert_view", ttl_s=900)
            action_url = f"{self.s.public_url}/alert.html?token={action_token}"
            try:
                ok = await send_guardian_alert(self.s.telegram_bot_token, chat_id,
                                               level, up.stages_seen, text,
                                               elder_name=elder_name, timeline_url=timeline,
                                               action_url=action_url)
            except Exception as e:
                log.warning("alert raised: %s", e)
                ok = False
            try:
                db.insert_alert(self.session_id, level, ok, action_token=action_token)
            except Exception as e:
                log.warning("alert persist failed: %s", e)
            await self.send({"type": "alert_sent", "level": level, "delivered": ok, "action_url": action_url})

    async def run(self) -> None:
        # S3-A: Hard cap MAX_STT_MINUTES_PER_DAY (refuse when exceeded)
        today_mins = db.get_daily_stt_minutes()
        if today_mins >= self.s.max_stt_minutes_per_day:
            log.warning("Session rejected: daily STT budget exceeded (%.1f/%.1f min)", today_mins, self.s.max_stt_minutes_per_day)
            await self.send({
                "type": "error",
                "message": f"Daily STT budget exceeded ({self.s.max_stt_minutes_per_day:.0f} min limit). Kavach is paused until tomorrow to prevent unexpected costs.",
                "stt_minutes_today": today_mins,
                "max_stt_minutes_per_day": self.s.max_stt_minutes_per_day,
            })
            return

        self.session_id = db.insert_session(self.elder_id, synthetic=self.s.mock_stt or bool(self.replay))
        active_sessions[self.session_id] = self
        await self.stt.open()
        await self.send({"type": "state", "state": "listening", "lang": self.lang,
                         "mock": self.s.mock_stt, "session_id": self.session_id,
                         "stt_minutes_today": today_mins,
                         "max_stt_minutes_per_day": self.s.max_stt_minutes_per_day})
        tasks = [asyncio.create_task(self._from_browser()), asyncio.create_task(self._from_stt())]
        if self.replay and not self.s.mock_stt:
            tasks.append(asyncio.create_task(self._replay_wav()))
        try:
            done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
            if self._fallback_task and not self._fallback_task.done() and not self._stop:
                try:
                    await self._fallback_task
                except asyncio.CancelledError:
                    pass
            for p in pending:
                p.cancel()
            for d in done:
                if d.exception():
                    log.error("session task failed: %r", d.exception())
        finally:
            active_sessions.pop(self.session_id, None)
            if self._fallback_task and not self._fallback_task.done():
                self._fallback_task.cancel()
            self._stop = True
            await self.stt.close()
            # Record STT audio usage
            duration_m = (time.monotonic() - self.started) / 60.0
            db.record_stt_minutes(duration_m)
            try:
                db.finish_session(self.session_id, self.scorer.max_score, self.scorer.max_level)
            except Exception:
                pass
            try:
                await self.send({"type": "state", "state": "stopped", "max_score": self.scorer.max_score,
                                 "max_level": self.scorer.max_level, "session_id": self.session_id,
                                 "stt_minutes_today": db.get_daily_stt_minutes(),
                                 "max_stt_minutes_per_day": self.s.max_stt_minutes_per_day})
            except Exception:
                pass
