"""Device health and offline detection for Kavach listening devices."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from . import db
from .alerts import send_offline_alert
from .config import get_settings

log = logging.getLogger("kavach.health")


async def check_offline_devices(now: datetime | None = None) -> list[dict]:
    """Check for armed sessions missing heartbeats > 90s; send guardian offline alerts."""
    now_dt = now or datetime.now(timezone.utc)
    cutoff = now_dt - timedelta(seconds=90)
    sessions = db.get_offline_armed_sessions(cutoff)
    s = get_settings()
    alerted = []
    for sess in sessions:
        tg_chat_id = sess.get("telegram_chat_id") or s.telegram_chat_id
        try:
            dt = datetime.fromisoformat(sess["last_heartbeat"])
            delta_s = (now_dt - dt).total_seconds()
        except Exception:
            delta_s = 99.0
        delivered = await send_offline_alert(
            s.telegram_bot_token,
            tg_chat_id,
            elder_name=sess.get("elder_name", "your family member"),
            last_seen_s=delta_s,
        )
        db.mark_offline_alert_sent(sess["id"])
        db.insert_alert(sess["id"], level=-1, delivered=delivered)
        alerted.append({
            "session_id": sess["id"],
            "elder_name": sess["elder_name"],
            "last_seen_s": delta_s,
            "delivered": delivered,
        })
        log.warning("device offline alert sent for session %s (elder: %s, missed: %.1fs)",
                    sess["id"], sess["elder_name"], delta_s)
    return alerted
