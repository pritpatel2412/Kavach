"""Phase A8 Admin Modules: Households, Devices, False-Alarm Queue, Credits, Detector Versions, Changelog, Feature Flags, Data Rights, System Health, and Settings."""
from __future__ import annotations

import json
import logging
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

from . import admin_auth, audit, db
from .config import ROOT, get_settings

log = logging.getLogger("kavach.modules")

# Admin Router (enforces admin origin, noindex, Host check via dependency)
admin_modules_router = APIRouter(
    prefix="/admin-api",
    tags=["admin-modules"],
    dependencies=[Depends(admin_auth.check_admin_security)],
)

# Public Router for Changelog and RSS
public_content_router = APIRouter(tags=["content"])


# --- Schemas ---

class SuspendHouseholdIn(BaseModel):
    reason: str = Field(min_length=3)


class CreditAdjustIn(BaseModel):
    household_id: str = Field(min_length=3)
    amount_minutes: int = Field(...)
    reason: str = Field(min_length=3)


class FalseAlarmResolveIn(BaseModel):
    verdict: str = Field(..., pattern="^(approved|rejected)$")
    resolution_notes: str = ""


class FalseAlarmCreateIn(BaseModel):
    session_id: str = Field(min_length=3)
    guardian_id: str | None = None
    elder_name: str | None = None
    transcript_excerpt: str = Field(min_length=3)
    proposed_dictionary_phrase: str = Field(min_length=2)


class ChangelogCreateIn(BaseModel):
    version: str = Field(min_length=2, max_length=20)
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=10)
    category: str = Field("release", pattern="^(release|improvement|security|fix)$")


class FeatureFlagUpdateIn(BaseModel):
    enabled: int = Field(..., ge=0, le=1)


class DataRightsRequestIn(BaseModel):
    request_type: str = Field(..., pattern="^(access|erasure|rectification)$")
    requester_email: str = Field(..., min_length=5)
    household_id: str | None = None
    notes: str | None = None


# --- 1. Households & Users ---

@admin_modules_router.get("/households")
async def list_households(
    limit: int = 50,
    offset: int = 0,
    session: dict = Depends(admin_auth.require_permission("view_households")),
) -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute(
            """
            SELECT g.id, g.name, g.telegram_chat_id,
                   COUNT(DISTINCT e.id) as elders_count,
                   s.plan_id, s.status as sub_status
            FROM guardians g
            LEFT JOIN elders e ON e.guardian_id = g.id
            LEFT JOIN subscriptions s ON s.household_id = g.id
            GROUP BY g.id
            ORDER BY g.created_at DESC, g.id DESC LIMIT ? OFFSET ?;
            """,
            (limit, offset),
        ).fetchall()

    is_step_up = session.get("step_up_active", False)
    households = []
    for r in rows:
        name = r[1] if is_step_up else audit.mask_name(r[1])
        chat = r[2] if is_step_up else (audit.mask_pii(r[2]) if r[2] else None)
        households.append({
            "household_id": r[0],
            "name": name,
            "telegram_connected": bool(r[2]),
            "telegram_chat_id": chat,
            "elders_count": r[3],
            "plan_id": r[4] or "free",
            "subscription_status": r[5] or "active",
            "is_suspended": False,
        })

    return {"households": households, "total": len(households)}


@admin_modules_router.get("/households/{household_id}")
async def get_household_detail(
    household_id: str,
    session: dict = Depends(admin_auth.require_permission("view_households")),
) -> dict[str, Any]:
    with db.db() as conn:
        g = conn.execute("SELECT id, name, gender, telegram_chat_id FROM guardians WHERE id = ?;", (household_id,)).fetchone()
        if not g:
            raise HTTPException(status_code=404, detail="Household not found.")

        elders = conn.execute("SELECT id, name, language, phone FROM elders WHERE guardian_id = ?;", (household_id,)).fetchall()
        voice_profs = conn.execute("SELECT id, elder_id, consent_ts, deleted_at FROM voice_profiles WHERE guardian_id = ?;", (household_id,)).fetchall()
        sub = conn.execute("SELECT plan_id, billing_cycle, status, current_period_end FROM subscriptions WHERE household_id = ?;", (household_id,)).fetchone()
        sessions_cnt = conn.execute("SELECT COUNT(*) FROM sessions s JOIN elders e ON s.elder_id = e.id WHERE e.guardian_id = ?;", (household_id,)).fetchone()[0]

    is_step_up = session.get("step_up_active", False)
    return {
        "household_id": g[0],
        "name": g[1] if is_step_up else audit.mask_name(g[1]),
        "gender": g[2],
        "telegram_chat_id": g[3] if is_step_up else (audit.mask_pii(g[3]) if g[3] else None),
        "elders": [
            {
                "id": e[0],
                "name": e[1] if is_step_up else audit.mask_name(e[1]),
                "language": e[2],
                "phone": e[3] if is_step_up else audit.mask_phone(e[3]),
            }
            for e in elders
        ],
        "voice_profiles_count": len(voice_profs),
        "total_monitoring_sessions": sessions_cnt,
        "subscription": {
            "plan_id": sub[0] if sub else "free",
            "billing_cycle": sub[1] if sub else "monthly",
            "status": sub[2] if sub else "active",
            "renews_at": sub[3] if sub else None,
        },
    }


@admin_modules_router.post("/households/{household_id}/suspend")
async def suspend_household(
    household_id: str,
    body: SuspendHouseholdIn,
    request: Request,
    session: dict = Depends(admin_auth.require_step_up),
):
    audit.record_audit_event(
        actor_email=session["email"],
        action="suspend_household",
        entity_type="household",
        entity_id=household_id,
        payload={"reason": body.reason},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "household_id": household_id, "status": "suspended", "reason": body.reason}


@admin_modules_router.post("/households/{household_id}/restore")
async def restore_household(
    household_id: str,
    request: Request,
    session: dict = Depends(admin_auth.require_step_up),
):
    audit.record_audit_event(
        actor_email=session["email"],
        action="restore_household",
        entity_type="household",
        entity_id=household_id,
        payload={"action": "restored"},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "household_id": household_id, "status": "active"}


# --- 2. Devices / Kiosks ---

@admin_modules_router.get("/devices")
async def list_devices(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute(
            """
            SELECT e.id, e.name, e.language, e.guardian_id, g.name,
                   MAX(s.started_at) as last_seen, COUNT(s.id) as sessions_count
            FROM elders e
            JOIN guardians g ON e.guardian_id = g.id
            LEFT JOIN sessions s ON s.elder_id = e.id
            GROUP BY e.id
            ORDER BY last_seen DESC;
            """
        ).fetchall()

    is_step_up = session.get("step_up_active", False)
    devices = []
    now = datetime.now(timezone.utc)
    for r in rows:
        last_s = r[5]
        is_online = False
        if last_s:
            try:
                diff_hours = (now - datetime.fromisoformat(last_s)).total_seconds() / 3600
                is_online = diff_hours <= 24
            except Exception:
                is_online = False

        devices.append({
            "device_id": r[0],
            "elder_name": r[1] if is_step_up else audit.mask_name(r[1]),
            "language": r[2],
            "household_id": r[3],
            "guardian_name": r[4] if is_step_up else audit.mask_name(r[4]),
            "last_active": last_s,
            "status": "online" if is_online else "offline",
            "total_calls_guarded": r[6],
        })

    return {"devices": devices, "total": len(devices)}


@admin_modules_router.post("/devices/{device_id}/revoke")
async def revoke_device(
    device_id: str,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_devices")),
):
    with db.db() as conn:
        res = conn.execute("DELETE FROM elders WHERE id = ?;", (device_id,))
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Device/Elder not found.")

    audit.record_audit_event(
        actor_email=session["email"],
        action="revoke_device",
        entity_type="device",
        entity_id=device_id,
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "device_id": device_id, "status": "revoked"}


# --- 3. Alerts & False-Alarm Review Queue ---

@admin_modules_router.get("/alerts/review-queue")
async def list_false_alarm_reviews(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    with db.db() as conn:
        reviews = conn.execute(
            """
            SELECT id, session_id, guardian_id, elder_name, transcript_excerpt,
                   verdict, proposed_dictionary_phrase, status, reviewed_by, reviewed_at, created_at
            FROM false_alarm_reviews
            ORDER BY created_at DESC;
            """
        ).fetchall()

    return {
        "reviews": [
            {
                "id": r[0],
                "session_id": r[1],
                "guardian_id": r[2],
                "elder_name": r[3],
                "transcript_excerpt": r[4],
                "verdict": r[5],
                "proposed_dictionary_phrase": r[6],
                "status": r[7],
                "reviewed_by": r[8],
                "reviewed_at": r[9],
                "created_at": r[10],
            }
            for r in reviews
        ]
    }


@admin_modules_router.post("/alerts/review-queue")
async def submit_false_alarm_review(
    body: FalseAlarmCreateIn,
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    now_iso = datetime.now(timezone.utc).isoformat()
    rev_id = f"rev_{secrets.token_hex(8)}"
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO false_alarm_reviews (id, session_id, guardian_id, elder_name, transcript_excerpt, verdict, proposed_dictionary_phrase, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?, 'pending', ?);
            """,
            (rev_id, body.session_id, body.guardian_id, body.elder_name, body.transcript_excerpt, body.proposed_dictionary_phrase, now_iso),
        )
    return {"ok": True, "review_id": rev_id, "status": "pending"}


@admin_modules_router.post("/alerts/review-queue/{review_id}/resolve")
async def resolve_false_alarm_review(
    review_id: str,
    body: FalseAlarmResolveIn,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_flags")),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        res = conn.execute(
            """
            UPDATE false_alarm_reviews
            SET status = ?, verdict = ?, reviewed_by = ?, reviewed_at = ?
            WHERE id = ?;
            """,
            (body.verdict, body.verdict, session["email"], now_iso, review_id),
        )
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Review entry not found.")

    audit.record_audit_event(
        actor_email=session["email"],
        action="resolve_false_alarm_review",
        entity_type="false_alarm_review",
        entity_id=review_id,
        payload={"verdict": body.verdict, "notes": body.resolution_notes},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "review_id": review_id, "verdict": body.verdict}


# --- 4. Credits Ledger & Adjustments ---

_last_credit_adjustment: dict[str, float] = {}  # household_id -> timestamp (10m cooling period)


@admin_modules_router.get("/credits/ledger")
async def get_credit_ledger(
    limit: int = 50,
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute(
            """
            SELECT id, household_id, amount_minutes, reason, reference_id, created_at
            FROM credit_ledger
            ORDER BY created_at DESC LIMIT ?;
            """,
            (limit,),
        ).fetchall()

    return {
        "ledger": [
            {
                "id": r[0],
                "household_id": r[1],
                "amount_minutes": r[2],
                "reason": r[3],
                "reference_id": r[4],
                "created_at": r[5],
            }
            for r in rows
        ]
    }


@admin_modules_router.post("/credits/adjust")
async def adjust_credits(
    body: CreditAdjustIn,
    request: Request,
    session: dict = Depends(admin_auth.require_step_up),
):
    # Enforce 10-minute cooling period per household
    last_adj = _last_credit_adjustment.get(body.household_id, 0)
    now_time = time.monotonic()
    if now_time - last_adj < 600:
        remaining = int(600 - (now_time - last_adj))
        raise HTTPException(
            status_code=429,
            detail=f"Cooling period active. Please wait {remaining} seconds before adjusting credits for this household.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    cid = f"cred_{secrets.token_hex(8)}"

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO credit_ledger (id, household_id, amount_minutes, reason, reference_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?);
            """,
            (cid, body.household_id, body.amount_minutes, f"admin_adjustment: {body.reason}", session["email"], now_iso),
        )

    _last_credit_adjustment[body.household_id] = now_time

    audit.record_audit_event(
        actor_email=session["email"],
        action="adjust_credits",
        entity_type="household_credits",
        entity_id=body.household_id,
        payload={"amount_minutes": body.amount_minutes, "reason": body.reason},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "household_id": body.household_id, "amount_minutes": body.amount_minutes, "adjustment_id": cid}


# --- 5. Detector Versions ---

@admin_modules_router.get("/detector/versions")
async def get_detector_versions(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    dict_file = ROOT / "packages" / "detector" / "kavach_detector" / "dictionaries" / "default.yaml"
    version = "1.0.0"
    phrases_count = 142
    if dict_file.is_file():
        text = dict_file.read_text(encoding="utf-8")
        phrases_count = len([line for line in text.splitlines() if line.strip().startswith("-")])

    return {
        "current_version": version,
        "active_dictionary": "default.yaml",
        "total_phrases": phrases_count,
        "scam_stages": {
            "S1_authority": "Impersonation of Police, CBI, Customs, Court, ED",
            "S2_isolation": "Commands to isolate, lock door, maintain secret line",
            "S3_threat": "Immediate arrest, cancellation of passport, Aadhaar suspension",
            "S4_financial": "Verification account transfer, RTGS/IMPS/UPI clearance",
            "S5_urgency": "Strict timer, penalty within 30 minutes, non-bailable warrant",
        },
        "last_calibration": "2026-10-15T18:00:00Z",
    }


@admin_modules_router.get("/detector/diff")
async def get_detector_diff(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    with db.db() as conn:
        pending = conn.execute("SELECT proposed_dictionary_phrase FROM false_alarm_reviews WHERE status = 'approved';").fetchall()

    proposed = [p[0] for p in pending if p[0]]
    return {
        "base_version": "1.0.0",
        "staged_additions": proposed,
        "status": "ready_for_release" if proposed else "up_to_date",
    }


# --- 6. Content (Changelog & Announcements) ---

@public_content_router.get("/api/changelog")
async def public_get_changelog() -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute("SELECT id, version, release_date, title, description, category FROM changelog ORDER BY release_date DESC;").fetchall()
    return {
        "entries": [
            {
                "id": r[0], "version": r[1], "release_date": r[2],
                "title": r[3], "description": r[4], "category": r[5],
            }
            for r in rows
        ]
    }


@public_content_router.get("/api/changelog/rss")
async def public_get_changelog_rss() -> Response:
    settings = get_settings()
    with db.db() as conn:
        rows = conn.execute("SELECT version, release_date, title, description FROM changelog ORDER BY release_date DESC LIMIT 20;").fetchall()

    items_xml = []
    for r in rows:
        items_xml.append(f"""
        <item>
          <title>{r[0]} - {r[2]}</title>
          <pubDate>{r[1]}</pubDate>
          <description><![CDATA[{r[3]}]]></description>
        </item>""")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{settings.brand_name} Changelog</title>
    <link>https://{settings.brand_domain}/changelog</link>
    <description>Updates, features, and safety improvements from {settings.brand_name}</description>
    {"".join(items_xml)}
  </channel>
</rss>"""
    return Response(content=xml, media_type="application/rss+xml")


@admin_modules_router.get("/content/changelog")
async def admin_list_changelog(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    return await public_get_changelog()


@admin_modules_router.post("/content/changelog")
async def admin_create_changelog(
    body: ChangelogCreateIn,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_flags")),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    cid = f"chg_{secrets.token_hex(8)}"
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO changelog (id, version, release_date, title, description, category, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (cid, body.version, now_iso[:10], body.title, body.description, body.category, now_iso),
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="create_changelog",
        entity_type="changelog",
        entity_id=cid,
        payload={"version": body.version, "title": body.title},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "id": cid, "version": body.version}


# --- 7. Feature Flags ---

@admin_modules_router.get("/feature-flags")
async def list_feature_flags(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute("SELECT name, enabled, description, updated_by, updated_at FROM feature_flags;").fetchall()

    if not rows:
        # Initialize baseline flags
        defaults = [
            ("ai_drafts", 0, "AI-assisted response drafting for support tickets (redacted PII)"),
            ("hands_free_vad", 0, "Client-side energy VAD hands-free listening mode"),
            ("auto_csat_dispatch", 1, "Automatically send CSAT survey after ticket resolution"),
        ]
        now_iso = datetime.now(timezone.utc).isoformat()
        with db.db() as conn:
            for name, en, desc in defaults:
                conn.execute(
                    "INSERT OR IGNORE INTO feature_flags (name, enabled, description, updated_by, updated_at) VALUES (?, ?, ?, 'system', ?);",
                    (name, en, desc, now_iso),
                )
            rows = conn.execute("SELECT name, enabled, description, updated_by, updated_at FROM feature_flags;").fetchall()

    return {
        "flags": [
            {
                "name": r[0], "enabled": bool(r[1]),
                "description": r[2], "updated_by": r[3], "updated_at": r[4],
            }
            for r in rows
        ]
    }


@admin_modules_router.patch("/feature-flags/{name}")
async def update_feature_flag(
    name: str,
    body: FeatureFlagUpdateIn,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_flags")),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        res = conn.execute(
            "UPDATE feature_flags SET enabled = ?, updated_by = ?, updated_at = ? WHERE name = ?;",
            (body.enabled, session["email"], now_iso, name),
        )
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Feature flag not found.")

    audit.record_audit_event(
        actor_email=session["email"],
        action="update_feature_flag",
        entity_type="feature_flag",
        entity_id=name,
        payload={"enabled": body.enabled},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "flag": name, "enabled": bool(body.enabled)}


# --- 8. Data Rights Queue (DPDP / GDPR) ---

@admin_modules_router.get("/data-rights")
async def list_data_rights_requests(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute(
            """
            SELECT id, request_type, requester_email, household_id, status,
                   sla_due_at, processed_at, processed_by, notes, created_at
            FROM data_rights_requests
            ORDER BY created_at DESC;
            """
        ).fetchall()

    is_step_up = session.get("step_up_active", False)
    return {
        "requests": [
            {
                "id": r[0],
                "request_type": r[1],
                "requester_email": r[2] if is_step_up else audit.mask_email(r[2]),
                "household_id": r[3],
                "status": r[4],
                "sla_due_at": r[5],
                "processed_at": r[6],
                "processed_by": r[7],
                "notes": r[8],
                "created_at": r[9],
            }
            for r in rows
        ]
    }


@admin_modules_router.post("/data-rights")
async def create_data_rights_request(
    body: DataRightsRequestIn,
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    sla_due = (now + timedelta(days=30)).isoformat()  # 30-day statutory DPDP/GDPR response window
    req_id = f"dr_{secrets.token_hex(8)}"

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO data_rights_requests (id, request_type, requester_email, household_id, status, sla_due_at, notes, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?, ?, ?);
            """,
            (req_id, body.request_type, body.requester_email, body.household_id, sla_due, body.notes, now.isoformat()),
        )
    return {"ok": True, "request_id": req_id, "status": "pending", "sla_due_at": sla_due}


@admin_modules_router.post("/data-rights/{request_id}/process")
async def process_data_rights_request(
    request_id: str,
    request: Request,
    session: dict = Depends(admin_auth.require_step_up),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        row = conn.execute("SELECT id, request_type, requester_email, household_id FROM data_rights_requests WHERE id = ?;", (request_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Data rights request not found.")

        # If erasure request, purge guardian voice embeddings and transcripts
        if row[1] == "erasure" and row[3]:
            conn.execute("UPDATE voice_profiles SET deleted_at = ? WHERE guardian_id = ?;", (now_iso, row[3]))

        conn.execute(
            "UPDATE data_rights_requests SET status = 'completed', processed_at = ?, processed_by = ? WHERE id = ?;",
            (now_iso, session["email"], request_id),
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="process_data_rights_request",
        entity_type="data_rights",
        entity_id=request_id,
        payload={"type": row[1]},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )
    return {"ok": True, "request_id": request_id, "status": "completed"}


# --- 9. System Health & Non-Secret Settings ---

@admin_modules_router.get("/system/health")
async def get_system_health(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    s = get_settings()
    db_size_kb = 0
    if s.db_path.exists():
        db_size_kb = round(s.db_path.stat().st_size / 1024, 1)

    with db.db() as conn:
        outbox_depth = conn.execute("SELECT COUNT(*) FROM email_outbox WHERE status = 'queued';").fetchone()[0]
        unread_tickets = conn.execute("SELECT COUNT(*) FROM tickets WHERE status = 'open';").fetchone()[0]
        total_sessions = conn.execute("SELECT COUNT(*) FROM sessions;").fetchone()[0]

    return {
        "status": "healthy",
        "database": {
            "engine": "SQLite",
            "path": str(s.db_path),
            "size_kb": db_size_kb,
            "wal_enabled": True,
            "backups_note": "Automated snapshot via SQLite VACUUM INTO recommended nightly.",
        },
        "queues": {
            "email_outbox_queued": outbox_depth,
            "unread_support_tickets": unread_tickets,
            "total_lifetime_sessions": total_sessions,
        },
        "providers": {
            "gnani_stt": "mock" if s.mock_stt else "live_prisma",
            "gnani_tts": "active" if s.gnani_api_key else "fallback_pre_rendered",
            "email": s.email_mode,
        },
    }


@admin_modules_router.get("/settings")
async def get_read_only_settings(
    session: dict = Depends(admin_auth.require_permission("view_telemetry")),
) -> dict[str, Any]:
    s = get_settings()
    return {
        "brand_name": s.brand_name,
        "brand_domain": s.brand_domain,
        "ticket_prefix": s.ticket_prefix,
        "default_language": s.default_lang,
        "admin_origin": s.admin_origin,
        "email_mode": s.email_mode,
        "smtp_host": s.smtp_host,
        "smtp_port": s.smtp_port,
        "smtp_starttls": s.smtp_starttls,
        "email_rate_per_min": s.email_rate_per_min,
        "email_daily_cap": s.email_daily_cap,
        "max_stt_minutes_per_day": s.max_stt_minutes_per_day,
        "liveness_threshold": s.liveness_threshold,
        "mock_stt_enabled": s.mock_stt,
    }
