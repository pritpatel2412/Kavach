"""Guardians, elders, session timeline + feedback."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from . import db

router = APIRouter()


class GuardianIn(BaseModel):
    name: str
    gender: str
    telegram_chat_id: str | None = None


class ElderIn(BaseModel):
    guardian_id: str
    name: str
    language: str


class FeedbackIn(BaseModel):
    verdict: str = Field(pattern="^(real|false_alarm)$")


@router.post("/api/guardians")
def create_guardian(body: GuardianIn):
    if body.gender not in ("m", "f"):
        raise HTTPException(400, detail={"error": "invalid_gender"})
    gid = db.insert_guardian(body.name.strip(), body.gender, body.telegram_chat_id)
    return {"id": gid}


@router.get("/api/guardians")
def guardians():
    return {"guardians": db.list_guardians()}


@router.post("/api/elders")
def create_elder(body: ElderIn):
    if not db.get_guardian(body.guardian_id):
        raise HTTPException(404, detail={"error": "guardian_not_found"})
    eid = db.insert_elder(body.guardian_id, body.name.strip(), body.language.strip() or "hi-IN")
    return {"id": eid}


@router.get("/api/elders")
def elders():
    return {"elders": db.list_elders()}


@router.get("/api/sessions")
def sessions():
    return {"sessions": db.list_sessions()}


@router.get("/api/sessions/{session_id}")
def session_timeline(session_id: str):
    sess = db.get_session(session_id)
    if not sess:
        raise HTTPException(404, detail={"error": "session_not_found"})
    return {
        "id": sess["id"],
        "started_at": sess["started_at"],
        "ended_at": sess["ended_at"],
        "max_score": sess["max_score"],
        "max_level": sess["max_level"],
        "feedback": sess.get("feedback"),
        "events": sess["events"],
        "alerts": sess["alerts"],
    }


@router.post("/api/sessions/{session_id}/feedback")
def session_feedback(session_id: str, body: FeedbackIn):
    if not db.set_feedback(session_id, body.verdict):
        raise HTTPException(404, detail={"error": "session_not_found"})
    return {"ok": True}
