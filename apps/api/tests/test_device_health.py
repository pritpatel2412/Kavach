"""Tests for device health, heartbeats, and offline alert notification with fake clock."""
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app import db
from app.device_health import check_offline_devices
from app.main import app


def test_device_heartbeat_and_status(monkeypatch):
    with TestClient(app) as c:
        g = c.post("/api/guardians", json={"name": "Guardian", "gender": "m"}).json()
        headers = {"Authorization": f"Bearer {g['token']}"}
        e = c.post("/api/elders", json={"name": "Elder", "language": "hi-IN"}, headers=headers).json()["id"]

        # 1. No session -> idle
        st = c.get(f"/api/device/status?elder_id={e}", headers=headers).json()
        assert st["status"] == "idle"

        # 2. Start session -> armed
        sid = db.insert_session(e, synthetic=True)
        st = c.get(f"/api/device/status?elder_id={e}", headers=headers).json()
        assert st["status"] == "armed"
        assert st["last_heartbeat_s"] is not None

        # 3. Send heartbeat -> ok
        hb = c.post("/api/device/heartbeat", json={"session_id": sid, "elder_id": e})
        assert hb.status_code == 200 and hb.json()["ok"] is True


def test_offline_alert_triggered_after_90s_fake_clock(monkeypatch):
    """If heartbeat is missed > 90s while armed, trigger guardian Telegram alert."""
    sent_alerts = []

    async def fake_send_offline(token, chat_id, elder_name="your family member", last_seen_s=90.0):
        sent_alerts.append({"chat_id": chat_id, "elder_name": elder_name, "last_seen_s": last_seen_s})
        return True

    monkeypatch.setattr("app.device_health.send_offline_alert", fake_send_offline)

    with TestClient(app) as c:
        g = c.post("/api/guardians", json={"name": "Guardian Ravi", "gender": "m", "telegram_chat_id": "999"}).json()
        headers = {"Authorization": f"Bearer {g['token']}"}
        e = c.post("/api/elders", json={"name": "Savitri Ji", "language": "hi-IN"}, headers=headers).json()["id"]

        sid = db.insert_session(e, synthetic=True)

        # Baseline clock: now
        now = datetime.now(timezone.utc)

        # Heartbeat was recent (<30s): no alerts
        alerted = []
        with c:
            import asyncio
            alerted = asyncio.run(check_offline_devices(now=now))
        assert len(alerted) == 0
        assert len(sent_alerts) == 0

        # Advance fake clock by 95 seconds
        fake_future = now + timedelta(seconds=95)
        alerted = asyncio.run(check_offline_devices(now=fake_future))
        assert len(alerted) == 1
        assert alerted[0]["session_id"] == sid
        assert alerted[0]["elder_name"] == "Savitri Ji"
        assert len(sent_alerts) == 1
        assert sent_alerts[0]["chat_id"] == "999"
        assert sent_alerts[0]["elder_name"] == "Savitri Ji"

        # Check device status reports offline
        # Monkeypatch datetime in routes to match fake_future
        class FakeDatetime(datetime):
            @classmethod
            def now(cls, tz=None):
                return fake_future
        monkeypatch.setattr("app.routes.datetime", FakeDatetime)
        st = c.get(f"/api/device/status?elder_id={e}", headers=headers).json()
        assert st["status"] == "offline"

        # Calling check_offline_devices again does not send duplicate alert
        alerted_again = asyncio.run(check_offline_devices(now=fake_future + timedelta(seconds=10)))
        assert len(alerted_again) == 0

        # If elder device sends a heartbeat again, offline flag is reset
        db.update_heartbeat(sid)
        # Advance another 95s -> should alert again for new outage
        alerted_new = asyncio.run(check_offline_devices(now=fake_future + timedelta(seconds=110)))
        assert len(alerted_new) == 1
