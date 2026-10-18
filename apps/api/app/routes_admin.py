"""Admin API router mounted exclusively under /admin-api with strict isolation and origin enforcement."""
from __future__ import annotations

import logging
from typing import Any
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from . import admin_auth, audit
from .config import get_settings

log = logging.getLogger("kavach.routes_admin")

def check_admin_security(request: Request, response: Response) -> None:
    """Enforce X-Robots-Tag: noindex and admin-enabled gate on all /admin-api paths."""
    s = get_settings()
    if not s.admin_enabled:
        raise HTTPException(status_code=404, detail="Admin API is disabled.")

    # Check origin for cross-origin admin requests
    origin = request.headers.get("origin")
    if origin:
        allowed = {s.admin_origin, "http://localhost:3002", "http://127.0.0.1:3002", "http://localhost:3001"}
        if origin not in allowed:
            log.warning("Admin API cross-origin request rejected from %s", origin)
            raise HTTPException(status_code=403, detail="Cross-origin admin requests rejected.")

    response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"


admin_router = APIRouter(prefix="/admin-api", dependencies=[Depends(check_admin_security)])


class MagicLinkIn(BaseModel):
    email: str


class VerifyMagicLinkIn(BaseModel):
    token: str


class VerifyTotpIn(BaseModel):
    temp_token: str
    code: str


class StepUpIn(BaseModel):
    totp_code: str


class RevealPiiIn(BaseModel):
    entity_type: str
    entity_id: str
    reason: str = Field(min_length=5, description="Audited operational reason for revealing PII")


# --- Authentication Endpoints ---


@admin_router.post("/auth/magic-link")
def post_magic_link(body: MagicLinkIn, request: Request):
    ip = request.client.host if request.client else ""
    return admin_auth.request_magic_link(body.email, ip=ip)


@admin_router.post("/auth/verify-magic-link")
def post_verify_magic_link(body: VerifyMagicLinkIn):
    return admin_auth.verify_magic_link_token(body.token)


@admin_router.post("/auth/verify-totp")
def post_verify_totp(body: VerifyTotpIn, request: Request, response: Response):
    ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")
    result = admin_auth.complete_totp_login(body.temp_token, body.code, ip=ip, user_agent=user_agent)

    # Set httpOnly Secure SameSite cookie
    response.set_cookie(
        key=admin_auth.COOKIE_NAME,
        value=result["session_id"],
        httponly=True,
        secure=False,  # Set to False for local dev over http, True in production via proxy
        samesite="lax",
        max_age=admin_auth.ABSOLUTE_TIMEOUT_SECONDS,
        path="/admin-api",
    )
    return {
        "ok": True,
        "email": result["email"],
        "role": result["role"],
        "csrf_token": result["csrf_token"],
    }


@admin_router.post("/auth/step-up")
def post_step_up(
    body: StepUpIn,
    request: Request,
    session: dict = Depends(admin_auth.get_current_admin),
):
    ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")
    return admin_auth.verify_step_up_totp(session, body.totp_code, ip=ip, user_agent=user_agent)


@admin_router.post("/auth/logout")
def post_logout(response: Response, session: dict = Depends(admin_auth.get_current_admin)):
    admin_auth.invalidate_admin_session(session["session_id"])
    response.delete_cookie(key=admin_auth.COOKIE_NAME, path="/admin-api")
    audit.record_audit_event(
        actor_email=session["email"],
        action="admin_logout",
        entity_type="admin_session",
        entity_id=session["session_id"],
    )
    return {"ok": True, "message": "Logged out successfully."}


@admin_router.get("/auth/me")
def get_auth_me(session: dict = Depends(admin_auth.get_current_admin)):
    return {
        "email": session["email"],
        "role": session["role"],
        "csrf_token": session["csrf_token"],
        "step_up_active": session["step_up_active"],
        "step_up_valid_until": session["step_up_valid_until"],
    }


@admin_router.get("/config")
def get_admin_config(session: dict = Depends(admin_auth.get_current_admin)):
    s = get_settings()
    env_name = "LOCAL"
    if "staging" in s.brand_domain:
        env_name = "STAGING"
    elif "prod" in s.brand_domain or not s.mock_stt:
        env_name = "LOCAL"  # default local test environment
    return {
        "brand_name": s.brand_name,
        "brand_domain": s.brand_domain,
        "ticket_prefix": s.ticket_prefix,
        "environment": env_name,
        "admin_origin": s.admin_origin,
        "email_mode": s.email_mode,
        "mock_stt": s.mock_stt,
    }


# --- Audit Log Endpoints ---

@admin_router.get("/audit")
def get_audit_logs(
    actor_email: str | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session: dict = Depends(admin_auth.require_permission("view_audit")),
):
    return {
        "logs": audit.list_audit_events(
            actor_email=actor_email,
            action=action,
            entity_type=entity_type,
            limit=limit,
            offset=offset,
        )
    }


@admin_router.post("/audit/verify")
def post_verify_audit(session: dict = Depends(admin_auth.require_permission("verify_audit"))):
    result = audit.verify_audit_chain()
    audit.record_audit_event(
        actor_email=session["email"],
        action="admin_verify_audit_chain",
        entity_type="audit_chain",
        payload={"result": result["valid"], "total_records": result["total_records"]},
    )
    return result


@admin_router.post("/audit/reveal-pii")
def post_reveal_pii(
    body: RevealPiiIn,
    request: Request,
    session: dict = Depends(admin_auth.require_step_up),
):
    """Audited reveal of masked PII fields; strictly requires active step-up TOTP verification."""
    ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")
    audit.record_audit_event(
        actor_email=session["email"],
        action="admin_reveal_pii",
        entity_type=body.entity_type,
        entity_id=body.entity_id,
        payload={"reason": body.reason},
        ip=ip,
        user_agent=user_agent,
    )
    return {
        "ok": True,
        "authorized": True,
        "message": f"PII reveal authorization granted for {body.entity_type}:{body.entity_id}. Reason audited.",
    }
