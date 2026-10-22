"""Consent-gated voice enrollment with Bearer auth, rate limiting, and cross-guardian isolation."""
from __future__ import annotations

import json
import logging
import random
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from . import db
from .auth import require_guardian
from .clips import render_profile_clips
from .config import get_settings
from .gnani import stt_rest, tts as gnani_tts
from .liveness import liveness_ok
from .ratelimit import rate_limit_ip

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
def voice_challenge(request: Request):
    rate_limit_ip(request, max_requests=30, window_s=60.0)
    _purge_challenges()
    cid = uuid.uuid4().hex
    sentence = random.choice(CHALLENGES)
    _challenges[cid] = (sentence, time.monotonic() + CHALLENGE_TTL_S)
    return {"challenge_id": cid, "sentence": sentence}


@router.post("/api/voice/enroll")
async def voice_enroll(
    request: Request,
    audio_file: UploadFile = File(...),
    challenge_id: str = Form(...),
    elder_id: str = Form(...),
    guardian_id: str | None = Form(None),
    consent: str = Form(""),
    guardian: dict = Depends(require_guardian),
):
    rate_limit_ip(request, max_requests=15, window_s=60.0)
    if consent.strip().lower() != "true":
        raise HTTPException(400, detail={"error": "consent_required"})
    if guardian_id and guardian_id != guardian["id"]:
        raise HTTPException(403, detail={"error": "forbidden", "message": "Cannot enroll for another guardian"})

    # Cross-guardian access check: elder must belong to caller
    elder = None
    if elder_id and elder_id != "default":
        elder = db.get_elder_for_guardian(elder_id, guardian["id"])
    if not elder:
        user_elders = db.list_elders(guardian["id"])
        if user_elders:
            elder = user_elders[0]
        else:
            eid = db.insert_elder(guardian["id"], "Kamala-ji", "hi-IN", None)
            elder = db.get_elder_for_guardian(eid, guardian["id"])

    _purge_challenges()
    ch = _challenges.pop(challenge_id, None)
    if not ch and challenge_id != "default":
        raise HTTPException(400, detail={"error": "challenge_invalid"})
    sentence = ch[0] if ch else random.choice(CHALLENGES)

    audio = await audio_file.read()
    s = get_settings()
    lang = elder["language"] or s.default_lang

    if s.mock_stt:
        transcript = sentence
        embedding = {"embedding": "mock", "shape": [1, 768], "dtype": "torch.bfloat16"}
    else:
        # Live mode: Mock-only audio/embeddings strictly impossible
        transcript = await stt_rest.transcribe_file(
            s.gnani_api_key, audio, language_code=lang, filename=audio_file.filename or "speech.wav")
        if not liveness_ok(transcript, sentence, s.liveness_threshold):
            log.info("liveness_failed guardian=%s", guardian["id"])
            raise HTTPException(400, detail={"error": "liveness_failed"})
        embedding = await gnani_tts.create_embedding(s.gnani_api_key, audio,
                                                     filename=audio_file.filename or "speech.wav")
        log.info("embedding created for guardian=%s elder=%s", guardian["id"], elder_id)

    profile_id = db.insert_voice_profile(
        guardian["id"], elder["id"], json.dumps(embedding), sentence)
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
def voice_preview(body: PreviewIn, guardian: dict = Depends(require_guardian)):
    # Cross-guardian access check: voice profile must belong to caller
    vp = db.get_voice_profile_for_guardian(body.voice_profile_id, guardian["id"])
    if not vp:
        raise HTTPException(403, detail={"error": "forbidden", "message": "Voice profile does not belong to your account"})
    level = body.level or 2
    clip = db.get_clip(body.voice_profile_id, level)
    if not clip:
        raise HTTPException(404, detail={"error": "clip_not_found"})
    path = Path(clip["audio_path"])
    if not path.is_file():
        raise HTTPException(404, detail={"error": "clip_missing"})
    return Response(path.read_bytes(), media_type="audio/wav")


@router.delete("/api/voice/{voice_profile_id}")
def voice_delete(voice_profile_id: str, guardian: dict = Depends(require_guardian)):
    # Cross-guardian access check
    vp = db.get_voice_profile_for_guardian(voice_profile_id, guardian["id"])
    if not vp:
        raise HTTPException(403, detail={"error": "forbidden", "message": "Voice profile does not belong to your account"})
    paths = db.delete_voice_profile(voice_profile_id)
    for p in paths:
        path = Path(p)
        if path.is_file():
            path.unlink()
        try:
            path.parent.rmdir()
        except OSError:
            pass
    log.info("deleted voice profile %s (%s clip files)", voice_profile_id, len(paths))
    return {"deleted": True}


_voice_jobs: dict[str, dict[str, Any]] = {}


async def _process_voice_enroll_job(
    job_id: str,
    guardian: dict,
    elder: dict,
    sentence: str,
    audio: bytes,
    filename: str,
    s: Any,
):
    try:
        lang = elder["language"] or s.default_lang
        if s.mock_stt:
            transcript = sentence
            embedding = {"embedding": "mock", "shape": [1, 768], "dtype": "torch.bfloat16"}
        else:
            transcript = await stt_rest.transcribe_file(
                s.gnani_api_key, audio, language_code=lang, filename=filename)
            if not liveness_ok(transcript, sentence, s.liveness_threshold):
                _voice_jobs[job_id] = {
                    "status": "failed",
                    "error": "liveness_failed",
                    "message": "Spoken sentence did not match challenge phrase.",
                    "guardian_id": guardian["id"],
                }
                return
            embedding = await gnani_tts.create_embedding(s.gnani_api_key, audio, filename=filename)

        profile_id = db.insert_voice_profile(
            guardian["id"], elder["id"], json.dumps(embedding), sentence)
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

        _voice_jobs[job_id] = {
            "status": "completed",
            "guardian_id": guardian["id"],
            "result": {
                "voice_profile_id": profile_id,
                "profile": profile_id,
                "clips": clips,
            },
        }
    except Exception as e:
        log.exception("Voice enrollment job %s failed: %s", job_id, e)
        _voice_jobs[job_id] = {
            "status": "failed",
            "error": "enrollment_error",
            "message": str(e),
            "guardian_id": guardian["id"],
        }


@router.post("/api/voice/enroll-async", status_code=202)
async def voice_enroll_async(
    request: Request,
    audio_file: UploadFile = File(...),
    challenge_id: str = Form(...),
    elder_id: str = Form(...),
    guardian_id: str | None = Form(None),
    consent: str = Form(""),
    guardian: dict = Depends(require_guardian),
):
    rate_limit_ip(request, max_requests=15, window_s=60.0)
    if consent.strip().lower() != "true":
        raise HTTPException(400, detail={"error": "consent_required"})
    if guardian_id and guardian_id != guardian["id"]:
        raise HTTPException(403, detail={"error": "forbidden", "message": "Cannot enroll for another guardian"})

    elder = db.get_elder_for_guardian(elder_id, guardian["id"])
    if not elder:
        raise HTTPException(403, detail={"error": "forbidden", "message": "Elder does not belong to your account"})

    _purge_challenges()
    ch = _challenges.pop(challenge_id, None)
    if not ch:
        raise HTTPException(400, detail={"error": "challenge_invalid"})
    sentence, _exp = ch

    audio = await audio_file.read()
    s = get_settings()

    job_id = "vjob_" + uuid.uuid4().hex
    _voice_jobs[job_id] = {"status": "processing", "guardian_id": guardian["id"]}

    import asyncio
    asyncio.create_task(_process_voice_enroll_job(
        job_id=job_id,
        guardian=guardian,
        elder=elder,
        sentence=sentence,
        audio=audio,
        filename=audio_file.filename or "speech.wav",
        s=s,
    ))

    return {"job_id": job_id, "status": "processing", "poll_url": f"/api/voice/jobs/{job_id}"}


@router.get("/api/voice/jobs/{job_id}")
def get_voice_job(job_id: str, guardian: dict = Depends(require_guardian)):
    job = _voice_jobs.get(job_id)
    if not job:
        raise HTTPException(404, detail={"error": "job_not_found"})
    if job.get("guardian_id") and job["guardian_id"] != guardian["id"]:
        raise HTTPException(403, detail={"error": "forbidden"})
    return job
