"""Sprint D8: Ephemeral Demo Sandbox for interactive evaluation without credit burn."""
from __future__ import annotations

import logging
import secrets
import time
from datetime import datetime, timezone, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from . import db
from .ratelimit import get_client_ip, check_rate_limit
from .config import get_settings

log = logging.getLogger("kavach.sandbox")
router = APIRouter(prefix="/api/demo", tags=["Demo Sandbox"])

# Active in-memory sandbox tracking
_active_sandboxes: dict[str, dict[str, Any]] = {}


class SandboxResponse(BaseModel):
    ok: bool
    guardian_id: str
    elder_id: str
    token: str
    expires_at: str
    expires_in_seconds: int
    app_url: str
    tablet_url: str
    message: str


def cleanup_expired_sandboxes() -> int:
    """Removes expired sandbox sessions and associated SQLite records."""
    now = datetime.now(timezone.utc)
    expired = [
        gid for gid, data in _active_sandboxes.items()
        if datetime.fromisoformat(data["expires_at"]) <= now
    ]
    for gid in expired:
        _active_sandboxes.pop(gid, None)
        try:
            with db.db() as conn:
                conn.execute("DELETE FROM elders WHERE guardian_id = ?", (gid,))
                conn.execute("DELETE FROM guardians WHERE id = ?", (gid,))
                conn.execute("DELETE FROM sessions WHERE elder_id LIKE ?", (f"{gid}%",))
        except Exception as e:
            log.warning("Failed to purge expired sandbox %s: %s", gid, e)
    return len(expired)


@router.post("/sandbox", response_model=SandboxResponse)
def create_demo_sandbox(request: Request) -> dict[str, Any]:
    """Generates an ephemeral 2-hour household sandbox seeded with fake elder Kamala-ji.
    
    Guarantees:
    - Zero paid Gnani STT credits consumed (strictly mock STT only)
    - Zero outbound email or Telegram dispatch
    - 2-hour TTL with automatic purge
    - Strict client IP rate limiting
    """
    client_ip = get_client_ip(request)
    check_rate_limit(f"sandbox:{client_ip}", max_requests=5, window_s=3600.0)

    cleanup_expired_sandboxes()

    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=2)
    now_iso = now.isoformat()
    expires_iso = expires.isoformat()

    sandbox_id = f"sb_{secrets.token_hex(6)}"
    guardian_id = f"g_{sandbox_id}"
    elder_id = f"e_{sandbox_id}"
    token = f"sb_tok_{secrets.token_hex(16)}"

    # Seed isolated ephemeral records in database
    with db.db() as conn:
        # Create Guardian
        conn.execute(
            """
            INSERT INTO guardians (id, name, gender, telegram_chat_id, token)
            VALUES (?, ?, ?, ?, ?);
            """,
            (guardian_id, "Demo Caregiver (Sandbox)", "f", None, token),
        )

        # Create Elder (Kamala-ji)
        conn.execute(
            """
            INSERT INTO elders (id, guardian_id, name, language, phone)
            VALUES (?, ?, ?, ?, ?);
            """,
            (elder_id, guardian_id, "Kamala-ji", "hi-IN", "+919876543210"),
        )

        # Create 3 Sample Historical Incidents
        sample_incidents = [
            (f"sess_{sandbox_id}_1", elder_id, (now - timedelta(days=2)).isoformat(), (now - timedelta(days=2, minutes=-4)).isoformat(), 94, 3, "confirmed_scam"),
            (f"sess_{sandbox_id}_2", elder_id, (now - timedelta(days=5)).isoformat(), (now - timedelta(days=5, minutes=-2)).isoformat(), 45, 1, "false_positive"),
            (f"sess_{sandbox_id}_3", elder_id, (now - timedelta(days=6)).isoformat(), (now - timedelta(days=6, minutes=-5)).isoformat(), 88, 3, "confirmed_scam"),
        ]
        for sess_id, eid, started, ended, score, level, fb in sample_incidents:
            conn.execute(
                """
                INSERT INTO sessions (id, elder_id, started_at, ended_at, max_score, max_level, synthetic, feedback)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?);
                """,
                (sess_id, eid, started, ended, score, level, fb),
            )

    _active_sandboxes[guardian_id] = {
        "guardian_id": guardian_id,
        "elder_id": elder_id,
        "token": token,
        "client_ip": client_ip,
        "created_at": now_iso,
        "expires_at": expires_iso,
        "mock_stt_only": True,
        "allow_outbound": False,
    }

    settings = get_settings()
    app_base = settings.public_site_url

    return {
        "ok": True,
        "guardian_id": guardian_id,
        "elder_id": elder_id,
        "token": token,
        "expires_at": expires_iso,
        "expires_in_seconds": 7200,
        "app_url": f"{app_base}/app?demo_token={token}&sandbox=1",
        "tablet_url": f"{app_base}/app/elder?sandbox=1&elder_id={elder_id}",
        "message": "Interactive 2-hour demo sandbox created. Strictly zero real STT credits or emails consumed.",
    }
