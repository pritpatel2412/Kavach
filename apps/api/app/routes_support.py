"""Support ticket subsystem: public intake, signed magic-link customer portal, admin inbox, SLAs, macros, and KB."""
from __future__ import annotations

import hashlib
import json
import logging
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

from . import admin_auth, audit, db
from .config import get_settings
from .email import enqueue_email
from .ratelimit import rate_limit_ip
from .signed_token import create_action_token, verify_action_token

log = logging.getLogger("kavach.support")

public_support_router = APIRouter()
admin_support_router = APIRouter(prefix="/admin-api/tickets", dependencies=[Depends(admin_auth.check_admin_security)])
admin_kb_router = APIRouter(prefix="/admin-api/kb", dependencies=[Depends(admin_auth.check_admin_security)])

# SLA Configuration in Business Hours
SLA_HOURS = {
    "urgent": {"first_response": 1, "resolution": 4},
    "high": {"first_response": 4, "resolution": 24},
    "normal": {"first_response": 12, "resolution": 48},
    "low": {"first_response": 24, "resolution": 96},
}

CATEGORIES = (
    "scam_emergency",
    "billing",
    "account_login",
    "device_listening",
    "voice_consent",
    "privacy_data",
    "bug",
    "feedback",
)

CANNED_MACROS = [
    {
        "id": "macro-scam-emergency",
        "title": "🚨 Urgent: National Cybercrime Helpline Protocol (1930)",
        "category": "scam_emergency",
        "body": "If you or your family member is currently on a suspicious phone call demanding money or threatening arrest, HANG UP IMMEDIATELY. Law enforcement authorities in India NEVER conduct arrests or demand bank transfers over video calls. Call the National Cybercrime Helpline at 1930 immediately or file a report at https://cybercrime.gov.in.",
    },
    {
        "id": "macro-device-reboot",
        "title": "Tabletop Device Offline & Heartbeat Guide",
        "category": "device_listening",
        "body": "If the elder tabletop device shows 'Offline', please verify: 1) The device is plugged into power and connected to home Wi-Fi; 2) The browser tab is open; 3) The microphone permission is set to 'Always Allow'.",
    },
    {
        "id": "macro-voice-purge",
        "title": "Voice Consent Purge Confirmation",
        "category": "voice_consent",
        "body": "Under the Digital Personal Data Protection (DPDP) Act 2023, you have the absolute right to purge voice cloning embeddings at any time. When purged, your voice model and pre-rendered clips are permanently deleted from disk and database.",
    },
]


# --- Pydantic Models ---

class SupportTicketCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    phone: str | None = None
    category: str = Field(pattern="^(scam_emergency|billing|account_login|device_listening|voice_consent|privacy_data|bug|feedback)$")
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=5)
    household_id: str | None = None
    hp: str = ""  # Honeypot
    diagnostics: dict | None = None


class CustomerReplyIn(BaseModel):
    message: str = Field(min_length=1)


class CustomerCsatIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    feedback: str | None = None


class AdminTicketReplyIn(BaseModel):
    body: str = Field(min_length=1)
    is_internal: bool = False
    new_status: str | None = None


class AdminTicketUpdateIn(BaseModel):
    status: str | None = Field(default=None, pattern="^(open|pending|on_hold|solved|closed|spam)$")
    priority: str | None = Field(default=None, pattern="^(urgent|high|normal|low)$")
    category: str | None = Field(default=None, pattern="^(scam_emergency|billing|account_login|device_listening|voice_consent|privacy_data|bug|feedback)$")
    assignee_email: str | None = None
    tags: list[str] | None = None


class MergeTicketIn(BaseModel):
    target_ticket_id: str


class KbArticleIn(BaseModel):
    slug: str
    category: str
    title: str
    content_markdown: str
    locale: str = "en"
    is_published: bool = True


# --- Helpers ---

def _generate_ticket_number() -> str:
    s = get_settings()
    prefix = s.ticket_prefix
    with db.db() as conn:
        cursor = conn.execute("SELECT COUNT(*) FROM tickets;")
        count = cursor.fetchone()[0] + 101
    return f"{prefix}-{count:06d}"


def _compute_sla_deadlines(priority: str) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    sla_cfg = SLA_HOURS.get(priority, SLA_HOURS["normal"])
    first_due = (now + timedelta(hours=sla_cfg["first_response"])).isoformat()
    res_due = (now + timedelta(hours=sla_cfg["resolution"])).isoformat()
    return first_due, res_due


# --- Public Endpoints ---

@public_support_router.post("/api/support")
def post_create_ticket(body: SupportTicketCreateIn, request: Request):
    """Public support intake with honeypot bot defense, SLA clock calculation, and emergency auto-reply."""
    rate_limit_ip(request, max_requests=10, window_s=60.0)

    # Honeypot bot trap
    if body.hp.strip():
        log.warning("Honeypot triggered for support submission")
        return {"ok": True, "ticket_number": "KAV-000000", "message": "Support request submitted."}

    clean_email = body.email.strip().lower()
    clean_name = body.name.strip()
    s = get_settings()

    # Determine priority: scam emergencies are always urgent
    if body.category == "scam_emergency":
        priority = "urgent"
    elif body.category in ("billing", "account_login", "privacy_data"):
        priority = "high"
    else:
        priority = "normal"

    first_due, res_due = _compute_sla_deadlines(priority)
    ticket_id = uuid.uuid4().hex
    ticket_number = _generate_ticket_number()
    message_id = uuid.uuid4().hex
    now_iso = datetime.now(timezone.utc).isoformat()

    # Create signed portal token (valid 30 days)
    portal_token = create_action_token(ticket_id, purpose="support_portal", ttl_s=86400 * 30)
    token_hash = hashlib.sha256(portal_token.encode("utf-8")).hexdigest()

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO tickets (
                id, ticket_number, requester_name, requester_email, requester_phone,
                category, priority, status, subject, household_id, assignee_email,
                access_token_hash, sla_first_response_due, sla_resolution_due,
                first_responded_at, resolved_at, closed_at, csat_rating, csat_feedback,
                tags, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, NULL, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, '[]', ?, ?);
            """,
            (
                ticket_id,
                ticket_number,
                clean_name,
                clean_email,
                body.phone.strip() if body.phone else None,
                body.category,
                priority,
                body.subject.strip(),
                body.household_id,
                token_hash,
                first_due,
                res_due,
                now_iso,
                now_iso,
            ),
        )

        conn.execute(
            """
            INSERT INTO ticket_messages (
                id, ticket_id, sender_type, sender_email, is_internal, body, created_at
            ) VALUES (?, ?, 'customer', ?, 0, ?, ?);
            """,
            (message_id, ticket_id, clean_email, body.message.strip(), now_iso),
        )

    portal_url = f"{s.public_url}/support/t/{portal_token}"
    sla_hours = SLA_HOURS[priority]["first_response"]

    # Dispatch confirmation / emergency guidance email
    enqueue_email(
        recipient=clean_email,
        template="ticket_received",
        locale="en",
        variables={
            "name": clean_name,
            "ticket_number": ticket_number,
            "subject_clean": body.subject.strip(),
            "portal_url": portal_url,
            "sla_hours": sla_hours,
            "is_scam_emergency": body.category == "scam_emergency",
        },
        is_marketing=False,
    )

    log.info("Created support ticket %s [%s] for %s (priority: %s)", ticket_number, body.category, clean_email, priority)
    return {
        "ok": True,
        "ticket_number": ticket_number,
        "portal_url": portal_url,
        "message": "Your support ticket has been registered successfully.",
    }


@public_support_router.get("/api/support/t/{token}")
def get_customer_portal(token: str):
    """Customer portal view via signed magic-link token. Internal notes are strictly excluded."""
    payload = verify_action_token(token, expected_purpose="support_portal")
    if not payload:
        raise HTTPException(status_code=401, detail={"error": "invalid_portal_token", "message": "Support portal link expired or invalid."})

    ticket_id = payload["session_id"]
    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT id, ticket_number, requester_name, requester_email, category, priority,
                   status, subject, created_at, updated_at, csat_rating
            FROM tickets WHERE id = ?;
            """,
            (ticket_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        # Fetch customer-visible messages (is_internal = 0)
        cursor = conn.execute(
            """
            SELECT id, sender_type, sender_email, body, created_at
            FROM ticket_messages
            WHERE ticket_id = ? AND is_internal = 0
            ORDER BY created_at ASC;
            """,
            (ticket_id,),
        )
        messages = [
            {
                "id": m[0],
                "sender_type": m[1],
                "sender_name": "Support Specialist" if m[1] == "agent" else row[2],
                "body": m[3],
                "created_at": m[4],
            }
            for m in cursor.fetchall()
        ]

    return {
        "ticket_number": row[1],
        "category": row[4],
        "priority": row[5],
        "status": row[6],
        "subject": row[7],
        "created_at": row[8],
        "updated_at": row[9],
        "csat_rating": row[10],
        "messages": messages,
    }


@public_support_router.post("/api/support/t/{token}/reply")
def post_customer_reply(token: str, body: CustomerReplyIn):
    """Customer posts a reply; re-opens solved tickets automatically."""
    payload = verify_action_token(token, expected_purpose="support_portal")
    if not payload:
        raise HTTPException(status_code=401, detail={"error": "invalid_portal_token", "message": "Portal token expired."})

    ticket_id = payload["session_id"]
    now_iso = datetime.now(timezone.utc).isoformat()
    msg_id = uuid.uuid4().hex

    with db.db() as conn:
        cursor = conn.execute("SELECT requester_email, status FROM tickets WHERE id = ?;", (ticket_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        email, current_status = row[0], row[1]
        new_status = "open" if current_status in ("solved", "on_hold") else current_status

        conn.execute(
            """
            INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_email, is_internal, body, created_at)
            VALUES (?, ?, 'customer', ?, 0, ?, ?);
            """,
            (msg_id, ticket_id, email, body.message.strip(), now_iso),
        )
        conn.execute("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?;", (new_status, now_iso, ticket_id))

    return {"ok": True, "message_id": msg_id, "status": new_status}


@public_support_router.post("/api/support/t/{token}/csat")
def post_customer_csat(token: str, body: CustomerCsatIn):
    """Customer submits CSAT rating (1-5) following ticket resolution."""
    payload = verify_action_token(token, expected_purpose="support_portal")
    if not payload:
        raise HTTPException(status_code=401, detail={"error": "invalid_portal_token"})

    ticket_id = payload["session_id"]
    now_iso = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        conn.execute(
            "UPDATE tickets SET csat_rating = ?, csat_feedback = ?, updated_at = ? WHERE id = ?;",
            (body.rating, body.feedback.strip() if body.feedback else None, now_iso, ticket_id),
        )

    return {"ok": True, "rating": body.rating, "message": "Thank you for your feedback!"}


# --- Admin Inbox Endpoints ---

@admin_support_router.get("")
def get_admin_tickets(
    view: str = "open",
    category: str | None = None,
    priority: str | None = None,
    query: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session: dict = Depends(admin_auth.require_permission("view_tickets")),
):
    clauses = []
    params: list[Any] = []
    now_iso = datetime.now(timezone.utc).isoformat()

    if view == "open":
        clauses.append("status IN ('open', 'pending')")
    elif view == "unassigned":
        clauses.append("assignee_email IS NULL AND status != 'closed'")
    elif view == "mine":
        clauses.append("assignee_email = ?")
        params.append(session["email"])
    elif view == "solved":
        clauses.append("status = 'solved'")
    elif view == "sla_breached":
        clauses.append("(first_responded_at IS NULL AND sla_first_response_due < ?) AND status NOT IN ('solved', 'closed')")
        params.append(now_iso)
    elif view == "scam_emergency":
        clauses.append("category = 'scam_emergency'")
    elif view == "spam":
        clauses.append("status = 'spam'")

    if category:
        clauses.append("category = ?")
        params.append(category)
    if priority:
        clauses.append("priority = ?")
        params.append(priority)
    if query:
        clauses.append("(ticket_number LIKE ? OR subject LIKE ? OR requester_email LIKE ?)")
        p = f"%{query.strip()}%"
        params.extend([p, p, p])

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    sql = f"""
        SELECT id, ticket_number, requester_name, requester_email, category, priority,
               status, subject, household_id, assignee_email, sla_first_response_due,
               first_responded_at, csat_rating, created_at, updated_at
        FROM tickets {where}
        ORDER BY created_at DESC LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])

    with db.db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        count_cursor = conn.execute(f"SELECT COUNT(*) FROM tickets {where};", params[:-2])
        total = count_cursor.fetchone()[0]

    is_step_up = session.get("step_up_active", False)
    tickets_out = []
    for r in rows:
        email = r[3] if is_step_up else audit.mask_email(r[3])
        name = r[2] if is_step_up else audit.mask_name(r[2])
        tickets_out.append({
            "id": r[0],
            "ticket_number": r[1],
            "requester_name": name,
            "requester_email": email,
            "category": r[4],
            "priority": r[5],
            "status": r[6],
            "subject": r[7],
            "household_id": r[8],
            "assignee_email": r[9],
            "sla_first_response_due": r[10],
            "first_responded_at": r[11],
            "csat_rating": r[12],
            "created_at": r[13],
            "updated_at": r[14],
        })

    return {"total": total, "tickets": tickets_out, "pii_masked": not is_step_up}


@admin_support_router.get("/{ticket_id}")
def get_admin_ticket_detail(
    ticket_id: str,
    session: dict = Depends(admin_auth.require_permission("view_tickets")),
):
    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT id, ticket_number, requester_name, requester_email, requester_phone,
                   category, priority, status, subject, household_id, assignee_email,
                   sla_first_response_due, sla_resolution_due, first_responded_at,
                   resolved_at, csat_rating, csat_feedback, tags, created_at, updated_at
            FROM tickets WHERE id = ?;
            """,
            (ticket_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        # Fetch ALL messages including INTERNAL staff notes
        cursor = conn.execute(
            """
            SELECT id, sender_type, sender_email, is_internal, body, created_at
            FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC;
            """,
            (ticket_id,),
        )
        messages = [
            {
                "id": m[0],
                "sender_type": m[1],
                "sender_email": m[2],
                "is_internal": bool(m[3]),
                "body": m[4],
                "created_at": m[5],
            }
            for m in cursor.fetchall()
        ]

    is_step_up = session.get("step_up_active", False)
    return {
        "id": row[0],
        "ticket_number": row[1],
        "requester_name": row[2] if is_step_up else audit.mask_name(row[2]),
        "requester_email": row[3] if is_step_up else audit.mask_email(row[3]),
        "requester_phone": row[4] if is_step_up else audit.mask_phone(row[4]),
        "category": row[5],
        "priority": row[6],
        "status": row[7],
        "subject": row[8],
        "household_id": row[9],
        "assignee_email": row[10],
        "sla_first_response_due": row[11],
        "sla_resolution_due": row[12],
        "first_responded_at": row[13],
        "resolved_at": row[14],
        "csat_rating": row[15],
        "csat_feedback": row[16],
        "tags": json.loads(row[17]) if row[17] else [],
        "created_at": row[18],
        "updated_at": row[19],
        "messages": messages,
        "pii_masked": not is_step_up,
    }


@admin_support_router.post("/{ticket_id}/reply")
def post_admin_ticket_reply(
    ticket_id: str,
    body: AdminTicketReplyIn,
    session: dict = Depends(admin_auth.require_permission("manage_tickets")),
):
    """Admin posts message: is_internal=True creates internal note; False sends public email to customer."""
    now_iso = datetime.now(timezone.utc).isoformat()
    msg_id = uuid.uuid4().hex
    s = get_settings()

    with db.db() as conn:
        cursor = conn.execute(
            "SELECT ticket_number, requester_name, requester_email, status, first_responded_at FROM tickets WHERE id = ?;",
            (ticket_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        t_num, req_name, req_email, curr_status, first_resp = row
        new_status = body.new_status or ("pending" if not body.is_internal else curr_status)
        first_resp_ts = first_resp or (now_iso if not body.is_internal else None)

        conn.execute(
            """
            INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_email, is_internal, body, created_at)
            VALUES (?, ?, 'agent', ?, ?, ?, ?);
            """,
            (msg_id, ticket_id, session["email"], 1 if body.is_internal else 0, body.body.strip(), now_iso),
        )

        conn.execute(
            """
            UPDATE tickets
            SET status = ?, first_responded_at = COALESCE(first_responded_at, ?), updated_at = ?
            WHERE id = ?;
            """,
            (new_status, first_resp_ts, now_iso, ticket_id),
        )

    # If public reply, enqueue email notification
    if not body.is_internal and req_email:
        portal_token = create_action_token(ticket_id, purpose="support_portal", ttl_s=86400 * 30)
        portal_url = f"{s.public_url}/support/t/{portal_token}"
        enqueue_email(
            recipient=req_email,
            template="ticket_reply",
            variables={
                "name": req_name,
                "agent_name": session["email"].split("@")[0].capitalize(),
                "ticket_number": t_num,
                "reply_body": body.body.strip(),
                "portal_url": portal_url,
            },
            ticket_id=ticket_id,
            is_marketing=False,
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="ticket_reply_internal" if body.is_internal else "ticket_reply_public",
        entity_type="ticket",
        entity_id=ticket_id,
        payload={"ticket_number": t_num, "is_internal": body.is_internal},
    )

    return {"ok": True, "message_id": msg_id, "status": new_status}


@admin_support_router.patch("/{ticket_id}")
def patch_admin_ticket(
    ticket_id: str,
    body: AdminTicketUpdateIn,
    session: dict = Depends(admin_auth.require_permission("manage_tickets")),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    s = get_settings()

    with db.db() as conn:
        cursor = conn.execute(
            "SELECT ticket_number, requester_name, requester_email, status FROM tickets WHERE id = ?;",
            (ticket_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Ticket not found.")
        t_num, req_name, req_email, old_status = row

        updates = ["updated_at = ?"]
        params: list[Any] = [now_iso]

        if body.status:
            updates.append("status = ?")
            params.append(body.status)
            if body.status in ("solved", "closed"):
                updates.append("resolved_at = COALESCE(resolved_at, ?)")
                params.append(now_iso)
        if body.priority:
            updates.append("priority = ?")
            params.append(body.priority)
        if body.category:
            updates.append("category = ?")
            params.append(body.category)
        if body.assignee_email is not None:
            updates.append("assignee_email = ?")
            params.append(body.assignee_email.strip() if body.assignee_email else None)
        if body.tags is not None:
            updates.append("tags = ?")
            params.append(json.dumps(body.tags))

        params.append(ticket_id)
        conn.execute(f"UPDATE tickets SET {', '.join(updates)} WHERE id = ?;", params)

    # If ticket solved, dispatch CSAT survey email
    if body.status == "solved" and old_status != "solved" and req_email:
        portal_token = create_action_token(ticket_id, purpose="support_portal", ttl_s=86400 * 30)
        portal_url = f"{s.public_url}/support/t/{portal_token}"
        enqueue_email(
            recipient=req_email,
            template="ticket_solved_csat",
            variables={"name": req_name, "ticket_number": t_num, "portal_url": portal_url},
            ticket_id=ticket_id,
            is_marketing=False,
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="ticket_update",
        entity_type="ticket",
        entity_id=ticket_id,
        payload={"ticket_number": t_num, "updates": body.model_dump(exclude_unset=True)},
    )


    return {"ok": True, "message": f"Ticket {t_num} updated."}


@admin_support_router.post("/{ticket_id}/merge")
def post_merge_ticket(
    ticket_id: str,
    body: MergeTicketIn,
    session: dict = Depends(admin_auth.require_step_up),
):
    """Merge source ticket into target ticket; requires step-up auth."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        # Check both tickets exist
        cursor = conn.execute("SELECT ticket_number FROM tickets WHERE id = ?;", (ticket_id,))
        src = cursor.fetchone()
        cursor = conn.execute("SELECT ticket_number FROM tickets WHERE id = ?;", (body.target_ticket_id,))
        tgt = cursor.fetchone()

        if not src or not tgt:
            raise HTTPException(status_code=404, detail="Source or target ticket not found.")

        # Reassign messages from source to target
        conn.execute("UPDATE ticket_messages SET ticket_id = ? WHERE ticket_id = ?;", (body.target_ticket_id, ticket_id))

        # Close source ticket
        note_body = f"[SYSTEM] Merged into ticket {tgt[0]} by {session['email']}."
        msg_id = uuid.uuid4().hex
        conn.execute(
            """
            INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_email, is_internal, body, created_at)
            VALUES (?, ?, 'system', 'system', 1, ?, ?);
            """,
            (msg_id, body.target_ticket_id, note_body, now_iso),
        )
        conn.execute("UPDATE tickets SET status = 'closed', updated_at = ? WHERE id = ?;", (now_iso, ticket_id))

    audit.record_audit_event(
        actor_email=session["email"],
        action="ticket_merge",
        entity_type="ticket",
        entity_id=ticket_id,
        payload={"merged_into_ticket_id": body.target_ticket_id, "source_ticket": src[0], "target_ticket": tgt[0]},
    )

    return {"ok": True, "merged": True, "target_ticket_number": tgt[0]}


@admin_support_router.get("/macros/list")
def get_macros_list(session: dict = Depends(admin_auth.require_permission("view_tickets"))):
    return {"macros": CANNED_MACROS}


@admin_support_router.get("/analytics/summary")
def get_support_analytics(session: dict = Depends(admin_auth.require_permission("view_tickets"))):
    """Support analytics: volume, backlog, first-response time, resolution time, CSAT."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        cursor = conn.execute("SELECT status, COUNT(*) FROM tickets GROUP BY status;")
        status_counts = dict(cursor.fetchall())

        cursor = conn.execute("SELECT category, COUNT(*) FROM tickets GROUP BY category;")
        category_counts = dict(cursor.fetchall())

        cursor = conn.execute("SELECT AVG(csat_rating), COUNT(csat_rating) FROM tickets WHERE csat_rating IS NOT NULL;")
        csat_avg, csat_count = cursor.fetchone()

        cursor = conn.execute(
            "SELECT COUNT(*) FROM tickets WHERE status NOT IN ('solved', 'closed') AND first_responded_at IS NULL AND sla_first_response_due < ?;",
            (now_iso,),
        )
        sla_breached = cursor.fetchone()[0]

    return {
        "by_status": status_counts,
        "by_category": category_counts,
        "csat_average": round(csat_avg, 2) if csat_avg else None,
        "csat_responses": csat_count or 0,
        "sla_breached_count": sla_breached,
    }


# --- Knowledge Base (KB) Endpoints ---

@public_support_router.get("/api/help/articles")
def get_public_kb_articles(category: str | None = None, query: str | None = None):
    """Public searchable knowledge base articles."""
    clauses = ["is_published = 1"]
    params: list[Any] = []
    if category:
        clauses.append("category = ?")
        params.append(category)
    if query:
        clauses.append("(title LIKE ? OR content_markdown LIKE ?)")
        p = f"%{query.strip()}%"
        params.extend([p, p])

    where = f"WHERE {' AND '.join(clauses)}"
    sql = f"SELECT id, slug, category, title, content_markdown, locale, created_at FROM kb_articles {where} ORDER BY title ASC;"

    with db.db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()

    return {
        "articles": [
            {
                "id": r[0],
                "slug": r[1],
                "category": r[2],
                "title": r[3],
                "content_markdown": r[4],
                "locale": r[5],
                "created_at": r[6],
            }
            for r in rows
        ]
    }


@admin_kb_router.get("")
def get_admin_kb_list(session: dict = Depends(admin_auth.require_permission("view_tickets"))):
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT id, slug, category, title, locale, is_published, created_at, updated_at FROM kb_articles ORDER BY created_at DESC;"
        )
        rows = cursor.fetchall()
    return {
        "articles": [
            {
                "id": r[0],
                "slug": r[1],
                "category": r[2],
                "title": r[3],
                "locale": r[4],
                "is_published": bool(r[5]),
                "created_at": r[6],
                "updated_at": r[7],
            }
            for r in rows
        ]
    }


@admin_kb_router.post("")
def post_admin_kb_article(
    body: KbArticleIn,
    session: dict = Depends(admin_auth.require_permission("manage_tickets")),
):
    aid = uuid.uuid4().hex
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO kb_articles (id, slug, category, title, content_markdown, locale, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                aid,
                body.slug.strip().lower(),
                body.category,
                body.title.strip(),
                body.content_markdown,
                body.locale,
                1 if body.is_published else 0,
                now_iso,
                now_iso,
            ),
        )
    return {"ok": True, "id": aid, "slug": body.slug}
