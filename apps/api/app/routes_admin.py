"""Admin API router mounted exclusively under /admin-api with strict isolation and origin enforcement."""
from __future__ import annotations

import logging
from typing import Any
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from . import admin_auth, audit
from .admin_auth import check_admin_security
from .config import get_settings

log = logging.getLogger("kavach.routes_admin")

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

    s = get_settings()
    is_secure = s.deploy_mode == "production" or request.url.scheme == "https"
    response.set_cookie(
        key=admin_auth.COOKIE_NAME,
        value=result["session_id"],
        httponly=True,
        secure=is_secure,
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


# --- Email Subsystem Endpoints ---

class TestSendIn(BaseModel):
    template: str = "waitlist_welcome"
    locale: str = "en"


class AddSuppressionIn(BaseModel):
    email: str
    reason: str = "manual"


@admin_router.get("/email/outbox")
def get_email_outbox(
    status: str | None = None,
    recipient: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from . import db
    clauses = []
    params: list[Any] = []
    if status:
        clauses.append("status = ?")
        params.append(status)
    if recipient:
        clauses.append("recipient LIKE ?")
        params.append(f"%{recipient.strip().lower()}%")

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    query = f"""
        SELECT id, recipient, template, locale, subject, status, attempts,
               next_attempt_at, error_message, message_id, campaign_id, ticket_id, created_at, sent_at
        FROM email_outbox {where}
        ORDER BY created_at DESC LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])

    with db.db() as conn:
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

    return {
        "emails": [
            {
                "id": r[0],
                "recipient": r[1],
                "template": r[2],
                "locale": r[3],
                "subject": r[4],
                "status": r[5],
                "attempts": r[6],
                "next_attempt_at": r[7],
                "error_message": r[8],
                "message_id": r[9],
                "campaign_id": r[10],
                "ticket_id": r[11],
                "created_at": r[12],
                "sent_at": r[13],
            }
            for r in rows
        ]
    }


@admin_router.post("/email/outbox/{email_id}/retry")
def post_retry_email(
    email_id: str,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from datetime import datetime, timezone
    from . import db
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        count = conn.execute(
            """
            UPDATE email_outbox
            SET status = 'queued', attempts = 0, next_attempt_at = ?, error_message = NULL
            WHERE id = ?;
            """,
            (now_iso, email_id),
        ).rowcount
    if not count:
        raise HTTPException(status_code=404, detail="Email record not found.")
    return {"ok": True, "message": f"Email {email_id} reset to queued for immediate retry."}


@admin_router.get("/email/outbox/{email_id}/preview")
def get_email_preview(
    email_id: str,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from . import db
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT subject, html_body, text_body, recipient, template, locale, status FROM email_outbox WHERE id = ?;",
            (email_id,),
        )
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Email record not found.")

    return {
        "subject": row[0],
        "html_body": row[1],
        "text_body": row[2],
        "recipient": row[3],
        "template": row[4],
        "locale": row[5],
        "status": row[6],
    }


@admin_router.post("/email/test-send")
def post_test_send(
    body: TestSendIn,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from .email.sender import enqueue_email, process_outbox_queue
    recipient = session["email"]
    eid = enqueue_email(
        recipient=recipient,
        template=body.template,
        locale=body.locale,
        variables={"name": "Administrator", "rank": 1, "invite_code": "TEST-BETA-2026", "coupon_code": "COMMUNITY50", "expires_in_minutes": 10, "login_link": "http://localhost:3002/auth/verify?token=test"},
        is_marketing=False,
    )
    process_outbox_queue(max_batch=1)
    return {"ok": True, "email_id": eid, "recipient": recipient, "message": f"Test email enqueued and processed for {recipient}."}


@admin_router.get("/email/templates")
def get_templates(session: dict = Depends(admin_auth.require_permission("view_email"))):
    from .email.templates import TEMPLATES
    summary = []
    for name, locales in TEMPLATES.items():
        summary.append({
            "name": name,
            "available_locales": list(locales.keys()),
            "sample_subject": locales.get("en", {}).get("subject", ""),
        })
    return {"templates": summary}


@admin_router.get("/email/suppression")
def get_suppression_list(
    limit: int = 100,
    offset: int = 0,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from .email.suppression import list_suppression_list
    return {"suppression_list": list_suppression_list(limit=limit, offset=offset)}


@admin_router.post("/email/suppression")
def post_suppression(
    body: AddSuppressionIn,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from .email.suppression import add_to_suppression_list
    add_to_suppression_list(body.email, reason=body.reason)
    return {"ok": True, "message": f"Address {body.email} added to suppression list."}


@admin_router.delete("/email/suppression/{email}")
def delete_suppression(
    email: str,
    session: dict = Depends(admin_auth.require_permission("view_email")),
):
    from .email.suppression import remove_from_suppression_list
    removed = remove_from_suppression_list(email)
    if not removed:
        raise HTTPException(status_code=404, detail="Email not found in suppression list.")
    return {"ok": True, "message": f"Address {email} removed from suppression list."}


@admin_router.get("/email/domain-auth")
def get_domain_auth(session: dict = Depends(admin_auth.require_permission("view_email"))):
    from .email.dns_check import get_domain_dns_checklist
    return get_domain_dns_checklist()


@admin_router.get("/diagnostic/ip")
def diagnostic_ip(request: Request, session: dict = Depends(admin_auth.require_permission("view_system"))):
    """Admin-only diagnostic to inspect and calibrate TRUSTED_PROXY_HOPS behind reverse proxies."""
    from .ratelimit import get_client_ip
    s = get_settings()
    raw_xff = request.headers.get("x-forwarded-for")
    return {
        "client_host": request.client.host if request.client else None,
        "x_forwarded_for_raw": raw_xff,
        "x_forwarded_for_parsed": [ip.strip() for ip in raw_xff.split(",")] if raw_xff else [],
        "trusted_proxy_hops": s.trusted_proxy_hops,
        "resolved_client_ip": get_client_ip(request),
    }


