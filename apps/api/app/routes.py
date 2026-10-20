"""Guardians, elders, session timeline + feedback with Bearer auth and cross-guardian isolation."""
from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from . import db
from .auth import require_guardian
from .config import get_settings
from .device_health import check_offline_devices
from .session import active_sessions
from .signed_token import create_action_token, verify_action_token

log = logging.getLogger("kavach.routes")
router = APIRouter()


@router.get("/api/config")
def api_config():
    s = get_settings()
    return {
        "mock": s.mock_stt,
        "llm_enabled": bool(s.llm_provider and s.llm_api_key),
        "liveness_threshold": s.liveness_threshold,
        "max_stt_minutes_per_day": s.max_stt_minutes_per_day,
        "brand_name": s.brand_name,
        "brand_domain": s.brand_domain,
        "github_repo_url": s.github_repo_url,
    }


@router.get("/api/usage")
def api_usage():
    """S3-A: Return daily STT audio processing minutes and quota status."""
    s = get_settings()
    used = db.get_daily_stt_minutes()
    return {
        "stt_minutes_today": round(used, 2),
        "max_stt_minutes_per_day": s.max_stt_minutes_per_day,
        "budget_exceeded": used >= s.max_stt_minutes_per_day,
    }


class GuardianIn(BaseModel):
    name: str
    gender: str
    telegram_chat_id: str | None = None


class ElderIn(BaseModel):
    name: str
    language: str = "hi-IN"
    phone: str | None = None
    guardian_id: str | None = None


class FeedbackIn(BaseModel):
    verdict: str = Field(pattern="^(real|false_alarm)$")


class HeartbeatIn(BaseModel):
    session_id: str
    elder_id: str | None = None


@router.post("/api/guardians")
def create_guardian(body: GuardianIn):
    if body.gender not in ("m", "f"):
        raise HTTPException(400, detail={"error": "invalid_gender"})
    gid, token = db.insert_guardian(body.name.strip(), body.gender, body.telegram_chat_id)
    return {"id": gid, "token": token}


@router.get("/api/guardians")
def guardians(guardian: dict = Depends(require_guardian)):
    return {"guardians": [guardian]}


@router.post("/api/elders")
def create_elder(body: ElderIn, guardian: dict = Depends(require_guardian)):
    if body.guardian_id and body.guardian_id != guardian["id"]:
        raise HTTPException(403, detail={"error": "forbidden", "message": "Cannot create elder for another guardian"})
    eid = db.insert_elder(guardian["id"], body.name.strip(), body.language.strip() or "hi-IN", body.phone)
    return {"id": eid}


@router.get("/api/elders")
def elders(guardian: dict = Depends(require_guardian)):
    # Scoped strictly to caller's elders
    return {"elders": db.list_elders(guardian["id"])}


@router.get("/api/sessions")
def sessions(guardian: dict = Depends(require_guardian)):
    # Scoped strictly to caller's elders' sessions
    return {"sessions": db.list_sessions(guardian_id=guardian["id"])}


@router.get("/api/sessions/{session_id}")
def session_timeline(session_id: str, guardian: dict = Depends(require_guardian)):
    sess = db.get_session(session_id)
    if not sess:
        raise HTTPException(404, detail={"error": "session_not_found"})
    # Check ownership
    elder_id = sess.get("elder_id")
    if elder_id:
        elder = db.get_elder_for_guardian(elder_id, guardian["id"])
        if not elder:
            raise HTTPException(403, detail={"error": "forbidden", "message": "Access to another guardian's session is denied"})
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
def session_feedback(session_id: str, body: FeedbackIn, guardian: dict = Depends(require_guardian)):
    sess = db.get_session(session_id)
    if not sess:
        raise HTTPException(404, detail={"error": "session_not_found"})
    elder_id = sess.get("elder_id")
    if elder_id:
        elder = db.get_elder_for_guardian(elder_id, guardian["id"])
        if not elder:
            raise HTTPException(403, detail={"error": "forbidden", "message": "Access to another guardian's session is denied"})
    if not db.set_feedback(session_id, body.verdict):
        raise HTTPException(404, detail={"error": "session_not_found"})
    return {"ok": True}


@router.post("/api/device/heartbeat")
def device_heartbeat(body: HeartbeatIn):
    ok = db.update_heartbeat(body.session_id)
    return {"ok": ok}


@router.get("/api/device/status")
def device_status(elder_id: str = Query(...), guardian: dict = Depends(require_guardian)):
    elder = db.get_elder_for_guardian(elder_id, guardian["id"])
    if not elder:
        raise HTTPException(404, detail={"error": "elder_not_found"})
    latest = db.get_latest_session_for_elder(elder_id)
    if not latest or latest.get("ended_at"):
        return {"status": "idle", "last_heartbeat_s": None}
    hb = latest.get("last_heartbeat")
    if not hb:
        return {"status": "reconnecting", "last_heartbeat_s": None}
    try:
        dt = datetime.fromisoformat(hb)
        delta_s = (datetime.now(timezone.utc) - dt).total_seconds()
    except Exception:
        delta_s = 999.0
    if delta_s > 90:
        return {"status": "offline", "last_heartbeat_s": round(delta_s, 1)}
    elif delta_s > 45:
        return {"status": "reconnecting", "last_heartbeat_s": round(delta_s, 1)}
    return {"status": "armed", "last_heartbeat_s": round(delta_s, 1)}


@router.post("/api/device/check_offline")
async def device_check_offline():
    alerted = await check_offline_devices()
    return {"alerted": alerted}


@router.get("/api/alert/details")
def alert_details(token: str = Query(...)):
    # S3-F: Scoped by purpose: alert-view
    data = verify_action_token(token, expected_purpose="alert_view")
    if not data:
        raise HTTPException(403, detail={"error": "token_invalid_or_expired"})
    session_id = data["session_id"]
    sess = db.get_session(session_id)
    if not sess:
        raise HTTPException(404, detail={"error": "session_not_found"})
    elder_name = "Family Member"
    elder_phone = ""
    if sess.get("elder_id"):
        elder = db.get_elder(sess["elder_id"])
        if elder:
            elder_name = elder.get("name", elder_name)
            elder_phone = elder.get("phone", "")
    events = sess.get("events", [])
    latest_event = events[-1] if events else {}
    stages = latest_event.get("stages", [])
    excerpt = latest_event.get("excerpt", "")
    reason_en = latest_event.get("reason_en") or "Suspicious scam indicators detected"
    reason_hi = latest_event.get("reason_hi") or "संदिग्ध स्कैम संकेत पहचाने गए"
    exp = data.get("exp", 0)
    expires_in_s = max(0, int(exp - time.time()))
    return {
        "session_id": session_id,
        "elder_name": elder_name,
        "elder_phone": elder_phone,
        "max_level": sess.get("max_level", 0),
        "max_score": sess.get("max_score", 0),
        "stages": stages,
        "excerpt": excerpt,
        "reason_en": reason_en,
        "reason_hi": reason_hi,
        "expires_in_s": expires_in_s,
    }


@router.post("/api/alert/intercom_token")
def alert_intercom_token(token: str = Query(...)):
    """S3-F: Exchange a valid alert_view action token for a short-lived intercom-scoped token."""
    data = verify_action_token(token, expected_purpose="alert_view")
    if not data:
        raise HTTPException(403, detail={"error": "token_invalid_or_expired"})
    session_id = data["session_id"]
    intercom_token = create_action_token(session_id, purpose="intercom", ttl_s=300)
    return {"intercom_token": intercom_token, "session_id": session_id}


@router.websocket("/ws/intercom")
async def intercom_ws(ws: WebSocket, token: str = Query("")):
    # S3-F: Strictly require intercom-scoped token
    data = verify_action_token(token, expected_purpose="intercom")
    if not data:
        await ws.close(code=4003, reason="Invalid or expired action token (purpose must be intercom)")
        return
    session_id = data.get("session_id")
    await ws.accept()
    runner = active_sessions.get(session_id)
    if runner:
        runner.guardian_joined_intercom()
    try:
        while True:
            msg = await ws.receive()
            if msg.get("type") == "websocket.disconnect":
                break
            chunk = msg.get("bytes")
            if chunk and runner:
                # Zero persistence: stream audio directly to elder speaker over WS
                await runner.relay_intercom_audio(chunk)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        log.warning("intercom ws error: %s", e)
