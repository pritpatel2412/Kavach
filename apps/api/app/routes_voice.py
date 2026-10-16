"""Consent-gated voice enrollment. Embeddings are never written to logs."""
from __future__ import annotations

import json
import logging
import random
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from . import db
from .clips import render_profile_clips
from .config import get_settings
from .gnani import stt_rest, tts as gnani_tts
from .liveness import liveness_ok

log = logging.getLogger("kavach.voice")
router = APIRouter()

CHALLENGES = [
    "Namaste, mera naam Kavach hai aur main apne parivaar ki suraksha ke liye bol raha hoon.",
    "Please read this sentence clearly: I consent to clone my own voice to warn my family.",
    "आज मैं अपनी आवाज़ से अपने परिवार को ठगी की कॉल से बचाना चाहता हूँ।",
    "Cyber criminals never arrest anyone on a phone call; hang up and call one nine three zero.",
    "यह वाक्य मैं अपनी मर्ज़ी से पढ़ रहा हूँ ताकि Kavach मेरी आवाज़ में चेतावनी दे सके।",
]

# in-memory, single-use, 5 minutes
_challenges: dict[str, tuple[str, float]] = {}
CHALLENGE_TTL_S = 5 * 60


class PreviewIn(BaseModel):
    voice_profile_id: str
    level: int | None = 2


def _purge_challenges(now: float | None = None) -> None:
    t = now if now is not None else time.monotonic()
    dead = [k for k, (_, exp) in _challenges.items() if exp < t]
    for k in dead:
        _challenges.pop(k, None)


@router.get("/api/voice/challenge")
def voice_challenge():
    _purge_challenges()
    cid = uuid.uuid4().hex
    sentence = random.choice(CHALLENGES)
    _challenges[cid] = (sentence, time.monotonic() + CHALLENGE_TTL_S)
    return {"challenge_id": cid, "sentence": sentence}


@router.post("/api/voice/enroll")
async def voice_enroll(
    audio_file: UploadFile = File(...),
    challenge_id: str = Form(...),
    guardian_id: str = Form(...),
    elder_id: str = Form(...),
    consent: str = Form(""),
):
    if consent.strip().lower() != "true":
        raise HTTPException(400, detail={"error": "consent_required"})
    _purge_challenges()
    ch = _challenges.pop(challenge_id, None)
    if not ch:
        raise HTTPException(400, detail={"error": "challenge_invalid"})
    sentence, _exp = ch
    guardian = db.get_guardian(guardian_id)
    elder = db.get_elder(elder_id)
    if not guardian or not elder:
        raise HTTPException(404, detail={"error": "not_found"})

    audio = await audio_file.read()
    s = get_settings()
    lang = elder["language"] or s.default_lang
    if s.mock_stt:
        transcript = sentence
        embedding = {"embedding": "mock", "shape": [1, 768], "dtype": "torch.bfloat16"}
    else:
        transcript = await stt_rest.transcribe_file(
            s.gnani_api_key, audio, language_code=lang, filename=audio_file.filename or "speech.wav")
        if not liveness_ok(transcript, sentence, s.liveness_threshold):
            log.info("liveness_failed guardian=%s", guardian_id)
            raise HTTPException(400, detail={"error": "liveness_failed"})
        embedding = await gnani_tts.create_embedding(s.gnani_api_key, audio,
                                                     filename=audio_file.filename or "speech.wav")
        # Do not log `embedding` (biometric-like). Guardian/elder ids only.
        log.info("embedding created for guardian=%s elder=%s", guardian_id, elder_id)

    profile_id = db.insert_voice_profile(
        guardian_id, elder_id, json.dumps(embedding), sentence)
    clips = await render_profile_clips(
        profile=profile_id,
        lang=lang,
        embedding=embedding,
        elder_name=elder["name"],
        guardian_name=guardian["name"],
        gender=guardian["gender"],
        mock=s.mock_stt,
    )
    for c in clips:
        if c.get("url"):
            path = s.clips_dir / profile_id / f"{c['lang']}_L{c['level']}.wav"
            db.insert_clip(profile_id, int(c["level"]), c["lang"], str(path))
    return {"voice_profile_id": profile_id, "profile": profile_id, "clips": clips}


@router.post("/api/voice/preview")
def voice_preview(body: PreviewIn):
    level = body.level or 2
    clip = db.get_clip(body.voice_profile_id, level)
    if not clip:
        raise HTTPException(404, detail={"error": "clip_not_found"})
    path = Path(clip["audio_path"])
    if not path.is_file():
        raise HTTPException(404, detail={"error": "clip_missing"})
    return Response(path.read_bytes(), media_type="audio/wav")


@router.delete("/api/voice/{voice_profile_id}")
def voice_delete(voice_profile_id: str):
    paths = db.delete_voice_profile(voice_profile_id)
    for p in paths:
        path = Path(p)
        if path.is_file():
            path.unlink()
        # remove empty profile folder
        try:
            path.parent.rmdir()
        except OSError:
            pass
    log.info("deleted voice profile %s (%s clip files)", voice_profile_id, len(paths))
    return {"deleted": True}
