"""Waitlist end-to-end subsystem: public double opt-in, unsubscribe, admin CRM, invite codes, and campaigns."""
from __future__ import annotations

import hashlib
import json
import logging
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

from . import admin_auth, audit, db
from .config import get_settings
from .email import add_to_suppression_list, enqueue_email, is_suppressed
from .ratelimit import rate_limit_ip
from .signed_token import create_action_token, verify_action_token

log = logging.getLogger("kavach.waitlist")

public_waitlist_router = APIRouter(prefix="/api/waitlist")
admin_waitlist_router = APIRouter(prefix="/admin-api/waitlist", dependencies=[Depends(admin_auth.check_admin_security)])


# --- Pydantic Models ---

class WaitlistPublicIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str | None = None
    phone: str | None = None
    language: str = Field(default="hi-IN", pattern="^(hi-IN|en-IN|gu-IN|hi|en|gu)$")
    city: str | None = None
    for_who: str | None = None
    consent: bool = True
    consent_version: str = "2026-10-v1"
    hp: str = ""  # Honeypot: must be empty
    source: str = "direct"
    utm_source: str | None = None
    utm_campaign: str | None = None


class WaitlistNoteIn(BaseModel):
    note: str = Field(min_length=1)


class WaitlistTagIn(BaseModel):
    tags: list[str]


class WaitlistInviteIn(BaseModel):
    coupon_code: str = "KAVACH50"


class BulkActionIn(BaseModel):
    ids: list[str] = Field(min_length=1)
    action: str = Field(pattern="^(tag|resend_confirm|invite|delete)$")
    tag: str | None = None
    coupon_code: str | None = "KAVACH50"


class CreateCampaignIn(BaseModel):
    name: str = Field(min_length=3)
    segment_filter: str = Field(default="confirmed", pattern="^(all|confirmed|pending_confirm|invited)$")
    template: str = "broadcast_base"
    subject: str = Field(min_length=3)
    body_text: str = ""


# --- Public Endpoints ---

@public_waitlist_router.post("")
def post_waitlist_signup(body: WaitlistPublicIn, request: Request):
    """Public waitlist registration with honeypot bot defense, per-IP rate limiting, and double opt-in."""
    rate_limit_ip(request, max_requests=10, window_s=60.0)

    # Honeypot check: silently accept bots without persisting
    if body.hp.strip():
        log.warning("Honeypot triggered for waitlist submission from %s", request.client.host if request.client else "")
        return {
            "ok": True,
            "status": "pending_confirm",
            "message": "Thank you! Please check your email to confirm your waitlist reservation.",
        }

    if not body.email and not body.phone:
        raise HTTPException(status_code=400, detail={"error": "missing_contact", "message": "Email or phone number is required."})

    clean_email = body.email.strip().lower() if body.email else None
    clean_phone = body.phone.strip() if body.phone else None
    ip = request.client.host if request.client else ""
    now_iso = datetime.now(timezone.utc).isoformat()
    s = get_settings()

    # Check for duplicate
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT id, status, confirmation_token_hash FROM waitlist WHERE email = ? OR (phone = ? AND phone IS NOT NULL);",
            (clean_email, clean_phone),
        )
        existing = cursor.fetchone()

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    if existing:
        existing_id, status, existing_token_hash = existing
        # If pending and email provided, allow resending confirmation
        if status == "pending_confirm" and clean_email:
            with db.db() as conn:
                conn.execute(
                    "UPDATE waitlist SET confirmation_token_hash = ?, updated_at = ? WHERE id = ?;",
                    (token_hash, now_iso, existing_id),
                )
            confirm_url = f"{s.public_site_url}/waitlist/confirmed?token={raw_token}"
            enqueue_email(
                recipient=clean_email,
                template="waitlist_confirm",
                locale=body.language[:2],
                variables={"name": body.name, "confirm_url": confirm_url},
                is_marketing=False,
            )
        return {
            "ok": True,
            "status": status,
            "message": "Thank you! Please check your email to confirm your waitlist reservation.",
        }

    # Insert new record
    waitlist_id = uuid.uuid4().hex
    initial_status = "pending_confirm" if clean_email else "confirmed"

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO waitlist (
                id, name, email, phone, language, city, for_who, consent_version,
                source, utm_source, utm_campaign, status, confirmation_token_hash,
                confirmed_at, invite_code, invited_at, tags, notes, ip, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, '[]', '[]', ?, ?, ?);
            """,
            (
                waitlist_id,
                body.name.strip(),
                clean_email,
                clean_phone,
                body.language,
                body.city.strip() if body.city else None,
                body.for_who.strip() if body.for_who else None,
                body.consent_version,
                body.source,
                body.utm_source,
                body.utm_campaign,
                initial_status,
                token_hash if clean_email else None,
                ip,
                now_iso,
                now_iso,
            ),
        )

    # If email provided, enqueue double opt-in confirmation email
    if clean_email:
        confirm_url = f"{s.public_site_url}/waitlist/confirmed?token={raw_token}"
        enqueue_email(
            recipient=clean_email,
            template="waitlist_confirm",
            locale=body.language[:2],
            variables={"name": body.name, "confirm_url": confirm_url},
            is_marketing=False,
        )

    return {
        "ok": True,
        "status": initial_status,
        "message": "Thank you! Please check your email to confirm your waitlist reservation.",
    }


@public_waitlist_router.get("/confirm")
def get_confirm_waitlist(token: str = Query(...)):
    """Confirm waitlist double opt-in via signed token link."""
    token_hash = hashlib.sha256(token.strip().encode("utf-8")).hexdigest()
    now_iso = datetime.now(timezone.utc).isoformat()
    s = get_settings()

    with db.db() as conn:
        cursor = conn.execute(
            "SELECT id, name, email, language, status FROM waitlist WHERE confirmation_token_hash = ?;",
            (token_hash,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail={"error": "invalid_token", "message": "Confirmation link invalid or expired."})

        wid, name, email, language, current_status = row
        should_send_welcome = False
        if current_status == "pending_confirm":
            conn.execute(
                "UPDATE waitlist SET status = 'confirmed', confirmed_at = ?, updated_at = ? WHERE id = ?;",
                (now_iso, now_iso, wid),
            )
            cursor = conn.execute("SELECT COUNT(*) FROM waitlist WHERE status IN ('confirmed', 'invited', 'activated');")
            rank = cursor.fetchone()[0]
            should_send_welcome = True
        else:
            cursor = conn.execute("SELECT COUNT(*) FROM waitlist WHERE status IN ('confirmed', 'invited', 'activated');")
            rank = cursor.fetchone()[0]

    # Enqueue welcome email outside the write transaction to avoid database lock
    if should_send_welcome and email:
        enqueue_email(
            recipient=email,
            template="waitlist_welcome",
            locale=language[:2],
            variables={"name": name, "rank": rank},
            is_marketing=False,
        )

    status_str = "success" if should_send_welcome else "already_confirmed"
    msg_str = (
        f"Your spot is officially secured at Priority #{rank}."
        if should_send_welcome
        else f"Your spot was already secured at Priority #{rank}."
    )
    return {
        "ok": True,
        "confirmed": True,
        "status": status_str,
        "rank": rank,
        "message": msg_str,
    }



@public_waitlist_router.get("/unsubscribe")
@public_waitlist_router.post("/unsubscribe")
def get_or_post_unsubscribe(token: str = Query(...)):
    """One-click signed unsubscribe handler for marketing broadcasts."""
    payload = verify_action_token(token, expected_purpose="email_unsubscribe")
    if not payload:
        raise HTTPException(status_code=400, detail={"error": "invalid_token", "message": "Unsubscribe link invalid or expired."})

    email = payload["session_id"]
    add_to_suppression_list(email, reason="unsubscribed")

    with db.db() as conn:
        conn.execute("UPDATE waitlist SET status = 'unsubscribed' WHERE email = ?;", (email,))

    return {
        "ok": True,
        "unsubscribed": True,
        "email": email,
        "message": "You have been successfully unsubscribed from all marketing emails.",
    }


# --- Admin Endpoints ---

@admin_waitlist_router.get("")
def get_admin_waitlist(
    status: str | None = None,
    language: str | None = None,
    source: str | None = None,
    query: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session: dict = Depends(admin_auth.require_permission("view_waitlist")),
):
    clauses = []
    params: list[Any] = []
    if status:
        clauses.append("status = ?")
        params.append(status)
    if language:
        clauses.append("language LIKE ?")
        params.append(f"%{language}%")
    if source:
        clauses.append("source = ?")
        params.append(source)
    if query:
        clauses.append("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)")
        pattern = f"%{query.strip()}%"
        params.extend([pattern, pattern, pattern, pattern])

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    sql = f"""
        SELECT id, name, email, phone, language, city, for_who, status,
               confirmed_at, invite_code, invited_at, tags, created_at
        FROM waitlist {where}
        ORDER BY created_at DESC LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])

    with db.db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        count_cursor = conn.execute(f"SELECT COUNT(*) FROM waitlist {where};", params[:-2])
        total = count_cursor.fetchone()[0]

    # Mask PII by default unless step-up active
    is_step_up = session.get("step_up_active", False)
    entries = []
    for r in rows:
        email = r[2] if is_step_up else audit.mask_email(r[2])
        phone = r[3] if is_step_up else audit.mask_phone(r[3])
        name = r[1] if is_step_up else audit.mask_name(r[1])
        try:
            tags = json.loads(r[11]) if r[11] else []
        except Exception:
            tags = []
        entries.append({
            "id": r[0],
            "name": name,
            "email": email,
            "phone": phone,
            "language": r[4],
            "city": r[5],
            "for_who": r[6],
            "status": r[7],
            "confirmed_at": r[8],
            "invite_code": r[9],
            "invited_at": r[10],
            "tags": tags,
            "created_at": r[12],
        })

    return {"total": total, "entries": entries, "pii_masked": not is_step_up}


@admin_waitlist_router.get("/{waitlist_id}")
def get_waitlist_detail(
    waitlist_id: str,
    session: dict = Depends(admin_auth.require_permission("view_waitlist")),
):
    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT id, name, email, phone, language, city, for_who, consent_version,
                   source, utm_source, utm_campaign, status, confirmed_at, invite_code,
                   invited_at, tags, notes, ip, created_at, updated_at
            FROM waitlist WHERE id = ?;
            """,
            (waitlist_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Waitlist record not found.")

        # Also fetch email history
        cursor = conn.execute(
            "SELECT id, template, subject, status, created_at, sent_at FROM email_outbox WHERE recipient = ? ORDER BY created_at DESC;",
            (row[2],),
        )
        email_history = [
            {"id": e[0], "template": e[1], "subject": e[2], "status": e[3], "created_at": e[4], "sent_at": e[5]}
            for e in cursor.fetchall()
        ]

    is_step_up = session.get("step_up_active", False)
    return {
        "id": row[0],
        "name": row[1] if is_step_up else audit.mask_name(row[1]),
        "email": row[2] if is_step_up else audit.mask_email(row[2]),
        "phone": row[3] if is_step_up else audit.mask_phone(row[3]),
        "language": row[4],
        "city": row[5],
        "for_who": row[6],
        "consent_version": row[7],
        "source": row[8],
        "utm_source": row[9],
        "utm_campaign": row[10],
        "status": row[11],
        "confirmed_at": row[12],
        "invite_code": row[13],
        "invited_at": row[14],
        "tags": json.loads(row[15]) if row[15] else [],
        "notes": json.loads(row[16]) if row[16] else [],
        "created_at": row[18],
        "email_history": email_history,
        "pii_masked": not is_step_up,
    }


@admin_waitlist_router.post("/{waitlist_id}/notes")
def post_waitlist_note(
    waitlist_id: str,
    body: WaitlistNoteIn,
    session: dict = Depends(admin_auth.require_permission("manage_waitlist")),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    note_obj = {"text": body.note.strip(), "author": session["email"], "created_at": now_iso}

    with db.db() as conn:
        cursor = conn.execute("SELECT notes FROM waitlist WHERE id = ?;", (waitlist_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Waitlist record not found.")

        notes = json.loads(row[0]) if row[0] else []
        notes.append(note_obj)
        conn.execute("UPDATE waitlist SET notes = ?, updated_at = ? WHERE id = ?;", (json.dumps(notes), now_iso, waitlist_id))

    audit.record_audit_event(
        actor_email=session["email"],
        action="waitlist_add_note",
        entity_type="waitlist",
        entity_id=waitlist_id,
        payload={"note_preview": body.note[:50]},
    )
    return {"ok": True, "notes": notes}


@admin_waitlist_router.post("/{waitlist_id}/invite")
def post_waitlist_invite(
    waitlist_id: str,
    body: WaitlistInviteIn,
    session: dict = Depends(admin_auth.require_permission("manage_waitlist")),
):
    """Generate a single-use invite pass code and dispatch beta_invite email."""
    s = get_settings()
    now_iso = datetime.now(timezone.utc).isoformat()
    invite_code = f"KV-{secrets.token_hex(3).upper()}"

    with db.db() as conn:
        cursor = conn.execute("SELECT name, email, language FROM waitlist WHERE id = ?;", (waitlist_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Waitlist record not found.")

        name, email, language = row
        conn.execute(
            "UPDATE waitlist SET status = 'invited', invite_code = ?, invited_at = ?, updated_at = ? WHERE id = ?;",
            (invite_code, now_iso, now_iso, waitlist_id),
        )

    if email:
        onboard_url = f"{s.public_url}/onboarding?invite={invite_code}"
        enqueue_email(
            recipient=email,
            template="beta_invite",
            locale=language[:2],
            variables={
                "name": name,
                "invite_code": invite_code,
                "coupon_code": body.coupon_code,
                "onboard_url": onboard_url,
            },
            is_marketing=False,
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="waitlist_invite_user",
        entity_type="waitlist",
        entity_id=waitlist_id,
        payload={"invite_code": invite_code, "coupon_code": body.coupon_code},
    )

    return {"ok": True, "invite_code": invite_code, "status": "invited"}


@admin_waitlist_router.post("/bulk-action")
def post_waitlist_bulk_action(
    body: BulkActionIn,
    session: dict = Depends(admin_auth.require_step_up),
):
    """Execute privileged bulk operations across selected waitlist entries; requires step-up auth."""
    now_iso = datetime.now(timezone.utc).isoformat()
    affected = 0

    with db.db() as conn:
        if body.action == "delete":
            for wid in body.ids:
                conn.execute("DELETE FROM waitlist WHERE id = ?;", (wid,))
                affected += 1
        elif body.action == "tag" and body.tag:
            clean_tag = body.tag.strip()
            for wid in body.ids:
                cursor = conn.execute("SELECT tags FROM waitlist WHERE id = ?;", (wid,))
                row = cursor.fetchone()
                if row:
                    tags = json.loads(row[0]) if row[0] else []
                    if clean_tag not in tags:
                        tags.append(clean_tag)
                        conn.execute("UPDATE waitlist SET tags = ?, updated_at = ? WHERE id = ?;", (json.dumps(tags), now_iso, wid))
                        affected += 1
        elif body.action == "invite":
            for wid in body.ids:
                code = f"KV-{secrets.token_hex(3).upper()}"
                conn.execute("UPDATE waitlist SET status = 'invited', invite_code = ?, invited_at = ?, updated_at = ? WHERE id = ?;", (code, now_iso, now_iso, wid))
                affected += 1

    audit.record_audit_event(
        actor_email=session["email"],
        action=f"waitlist_bulk_{body.action}",
        entity_type="waitlist",
        payload={"count": affected, "ids_sample": body.ids[:5]},
    )

    return {"ok": True, "action": body.action, "affected_records": affected}


@admin_waitlist_router.get("/analytics/summary")
def get_waitlist_analytics(session: dict = Depends(admin_auth.require_permission("view_waitlist"))):
    """Growth analytics: counts, confirmation rate, languages, cities, and sources."""
    with db.db() as conn:
        cursor = conn.execute("SELECT status, COUNT(*) FROM waitlist GROUP BY status;")
        status_counts = dict(cursor.fetchall())

        cursor = conn.execute("SELECT language, COUNT(*) FROM waitlist GROUP BY language;")
        language_counts = dict(cursor.fetchall())

        cursor = conn.execute("SELECT source, COUNT(*) FROM waitlist GROUP BY source;")
        source_counts = dict(cursor.fetchall())

        cursor = conn.execute("SELECT COUNT(*) FROM waitlist;")
        total_signups = cursor.fetchone()[0]

    confirmed = status_counts.get("confirmed", 0) + status_counts.get("invited", 0) + status_counts.get("activated", 0)
    conf_rate = round((confirmed / total_signups) * 100, 1) if total_signups > 0 else 0.0

    return {
        "total_signups": total_signups,
        "confirmed_count": confirmed,
        "confirmation_rate_percent": conf_rate,
        "by_status": status_counts,
        "by_language": language_counts,
        "by_source": source_counts,
    }


# --- Campaign Endpoints ---

@admin_waitlist_router.get("/campaigns/list")
def get_campaigns_list(session: dict = Depends(admin_auth.require_permission("manage_waitlist"))):
    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT id, name, segment_filter, template, subject, status,
                   total_recipients, sent_count, failed_count, unsubscribed_count, created_by, created_at
            FROM waitlist_campaigns ORDER BY created_at DESC;
            """
        )
        rows = cursor.fetchall()

    return {
        "campaigns": [
            {
                "id": r[0],
                "name": r[1],
                "segment_filter": r[2],
                "template": r[3],
                "subject": r[4],
                "status": r[5],
                "total_recipients": r[6],
                "sent_count": r[7],
                "failed_count": r[8],
                "unsubscribed_count": r[9],
                "created_by": r[10],
                "created_at": r[11],
            }
            for r in rows
        ]
    }


@admin_waitlist_router.post("/campaigns")
def post_create_campaign(
    body: CreateCampaignIn,
    session: dict = Depends(admin_auth.require_permission("manage_waitlist")),
):
    cid = uuid.uuid4().hex
    now_iso = datetime.now(timezone.utc).isoformat()

    # Determine recipient count for segment
    filter_sql = ""
    if body.segment_filter == "confirmed":
        filter_sql = "WHERE status = 'confirmed'"
    elif body.segment_filter == "pending_confirm":
        filter_sql = "WHERE status = 'pending_confirm'"
    elif body.segment_filter == "invited":
        filter_sql = "WHERE status = 'invited'"

    with db.db() as conn:
        cursor = conn.execute(f"SELECT COUNT(*) FROM waitlist {filter_sql};")
        count = cursor.fetchone()[0]

        conn.execute(
            """
            INSERT INTO waitlist_campaigns (
                id, name, segment_filter, template, subject, body_text,
                status, total_recipients, sent_count, failed_count, unsubscribed_count,
                created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, 0, 0, 0, ?, ?);
            """,
            (
                cid,
                body.name.strip(),
                body.segment_filter,
                body.template,
                body.subject.strip(),
                body.body_text,
                count,
                session["email"],
                now_iso,
            ),
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="campaign_create",
        entity_type="campaign",
        entity_id=cid,
        payload={"name": body.name, "segment": body.segment_filter, "recipients": count},
    )

    return {"ok": True, "campaign_id": cid, "total_recipients": count}


@admin_waitlist_router.post("/campaigns/{campaign_id}/send")
def post_send_campaign(
    campaign_id: str,
    session: dict = Depends(admin_auth.require_step_up),
):
    """Dispatch campaign broadcast with throttling; respects suppression list and requires step-up auth."""
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT id, name, segment_filter, template, subject, body_text, status FROM waitlist_campaigns WHERE id = ?;",
            (campaign_id,),
        )
        camp = cursor.fetchone()
        if not camp:
            raise HTTPException(status_code=404, detail="Campaign not found.")

        cid, name, segment, template, subject, body_text, status = camp
        if status not in ("draft", "paused"):
            raise HTTPException(status_code=400, detail=f"Campaign cannot be sent in status '{status}'.")

        filter_clause = "WHERE email IS NOT NULL AND status != 'unsubscribed'"
        if segment == "confirmed":
            filter_clause += " AND status = 'confirmed'"
        elif segment == "invited":
            filter_clause += " AND status = 'invited'"

        cursor = conn.execute(f"SELECT email, name, language FROM waitlist {filter_clause};")
        recipients = cursor.fetchall()

    enqueued_count = 0
    suppressed_count = 0
    for r in recipients:
        email, r_name, lang = r
        if is_suppressed(email):
            suppressed_count += 1
            continue

        enqueue_email(
            recipient=email,
            template=template,
            locale=lang[:2],
            variables={"name": r_name, "subject_title": subject, "headline": subject, "body_html": f"<p>{body_text}</p>", "body_text": body_text},
            campaign_id=campaign_id,
            is_marketing=True,
        )
        enqueued_count += 1

    with db.db() as conn:
        conn.execute(
            "UPDATE waitlist_campaigns SET status = 'running', sent_count = ?, unsubscribed_count = ? WHERE id = ?;",
            (enqueued_count, suppressed_count, campaign_id),
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="campaign_dispatch",
        entity_type="campaign",
        entity_id=campaign_id,
        payload={"enqueued": enqueued_count, "suppressed": suppressed_count},
    )

    return {
        "ok": True,
        "campaign_id": campaign_id,
        "enqueued": enqueued_count,
        "suppressed": suppressed_count,
        "status": "running",
    }
