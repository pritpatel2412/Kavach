"""Warning clip rendering. Single code path used by enroll AND scripts/prerender_clips.py.

Never logs embeddings. Writes WAV files under clips_dir/<profile>/<lang>_L<level>.wav.
"""
from __future__ import annotations

import logging
import struct
import wave
from io import BytesIO
from pathlib import Path

from .config import get_settings
from .gnani import tts as gnani_tts
from .interventions import load_warnings

log = logging.getLogger("kavach.clips")

# Names from Gnani docs; verify against /api/TTS/available-voices in Spike S5.
DEFAULT_VOICES = {"hi-IN": "Nalini", "en-IN": "Kaveri", "hi-en": "Poorvi"}


def tiny_wav_bytes(duration_ms: int = 200, rate: int = 16000) -> bytes:
    """Inaudible placeholder used in mock mode so enroll/preview work with zero credits."""
    n = max(1, rate * duration_ms // 1000)
    buf = BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(struct.pack("<" + "h" * n, *([0] * n)))
    return buf.getvalue()


def write_wav(path: Path, audio: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(audio)


def format_clip_text(copy: dict, *, elder_name: str, guardian_name: str, gender: str) -> str:
    key = "clip_text_f" if gender == "f" and copy.get("clip_text_f") else "clip_text"
    template = copy.get(key) or copy.get("clip_text") or ""
    return template.format(elder_name=elder_name or "आप", guardian_name=guardian_name or "Kavach")


def clip_rel_url(profile: str, lang: str, level: int) -> str:
    return f"/clips/{profile}/{lang}_L{level}.wav"


async def render_profile_clips(
    *,
    profile: str,
    lang: str,
    embedding: dict | None,
    elder_name: str = "आप",
    guardian_name: str = "Kavach",
    gender: str = "m",
    levels: tuple[int, ...] = (1, 2, 3),
    clips_dir: Path | None = None,
    api_key: str | None = None,
    mock: bool | None = None,
) -> list[dict]:
    """Pre-render L1–L3. Cloned voice first; Timbre default on clone failure (`fallback: true`)."""
    s = get_settings()
    clips_dir = clips_dir or s.clips_dir
    api_key = s.gnani_api_key if api_key is None else api_key
    mock = s.mock_stt if mock is None else mock
    warnings = load_warnings()
    by_lang = warnings.get(lang) or warnings.get("en-IN") or {}
    out: list[dict] = []
    for level in levels:
        copy = by_lang.get(level) or by_lang.get(str(level))
        if not copy:
            continue
        text = format_clip_text(copy, elder_name=elder_name, guardian_name=guardian_name, gender=gender)
        dest = clips_dir / profile / f"{lang}_L{level}.wav"
        fallback = False
        audio: bytes | None = None
        if mock:
            audio = tiny_wav_bytes()
        else:
            try:
                if embedding is not None:
                    audio = await gnani_tts.synthesize_cloned(api_key, text, embedding)
                else:
                    audio = await gnani_tts.synthesize(
                        api_key, text, voice=DEFAULT_VOICES.get(lang, "Nalini"), language=lang)
            except Exception as e:
                log.warning("cloned TTS failed for %s L%s (%s); falling back to default voice",
                            lang, level, type(e).__name__)
                fallback = True
                try:
                    audio = await gnani_tts.synthesize(
                        api_key, text, voice=DEFAULT_VOICES.get(lang, "Nalini"), language=lang)
                except Exception as e2:
                    log.warning("default TTS also failed for %s L%s: %s", lang, level, type(e2).__name__)
                    audio = None
        item: dict = {"lang": lang, "level": level, "url": clip_rel_url(profile, lang, level)}
        if fallback:
            item["fallback"] = True
        if audio is None:
            item["url"] = None
            out.append(item)
            continue
        write_wav(dest, audio)
        out.append(item)
    return out
