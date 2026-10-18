"""Suppression list manager for unsubscribed, bounced, complaint, or manually suppressed recipients."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from .. import db

log = logging.getLogger("kavach.email.suppression")


def is_suppressed(email: str) -> bool:
    """Check if an email address is present in the suppression list."""
    clean = email.strip().lower()
    with db.db() as conn:
        cursor = conn.execute("SELECT 1 FROM suppression_list WHERE email = ?;", (clean,))
        return cursor.fetchone() is not None


def add_to_suppression_list(email: str, reason: str = "unsubscribed") -> None:
    """Add recipient to suppression list."""
    clean = email.strip().lower()
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO suppression_list (email, reason, created_at)
            VALUES (?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
                reason = excluded.reason,
                created_at = excluded.created_at;
            """,
            (clean, reason, now_iso),
        )
    log.info("Email %s added to suppression list (reason: %s)", clean, reason)


def remove_from_suppression_list(email: str) -> bool:
    """Remove recipient from suppression list."""
    clean = email.strip().lower()
    with db.db() as conn:
        count = conn.execute("DELETE FROM suppression_list WHERE email = ?;", (clean,)).rowcount
    if count > 0:
        log.info("Email %s removed from suppression list", clean)
        return True
    return False


def list_suppression_list(limit: int = 100, offset: int = 0) -> list[dict]:
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT email, reason, created_at FROM suppression_list ORDER BY created_at DESC LIMIT ? OFFSET ?;",
            (limit, offset),
        )
        rows = cursor.fetchall()
    return [{"email": r[0], "reason": r[1], "created_at": r[2]} for r in rows]
