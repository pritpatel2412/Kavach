"""Tests for S3-A: Hard cap MAX_STT_MINUTES_PER_DAY with fake clock and usage tracking."""
import json
import pytest
from fastapi.testclient import TestClient

from app import db
from app.config import get_settings
from app.main import app


def test_daily_stt_usage_db_and_dates():
    # Usage on fake date 2026-11-01
    d1 = "2026-11-01"
    d2 = "2026-11-02"
    assert db.get_daily_stt_minutes(d1) == 0.0
    
    db.record_stt_minutes(5.5, d1)
    assert db.get_daily_stt_minutes(d1) == 5.5
    
    # Incremental update
    db.record_stt_minutes(4.5, d1)
    assert db.get_daily_stt_minutes(d1) == 10.0
    
    # Separate date remains 0
    assert db.get_daily_stt_minutes(d2) == 0.0


def test_api_usage_endpoint():
    with TestClient(app) as c:
        res = c.get("/api/usage")
        assert res.status_code == 200
        data = res.json()
        assert "stt_minutes_today" in data
        assert "max_stt_minutes_per_day" in data
        assert "budget_exceeded" in data


def test_session_rejected_when_daily_budget_exceeded(monkeypatch):
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Record usage that exceeds 30 minutes
    db.record_stt_minutes(35.0, today)
    assert db.get_daily_stt_minutes(today) >= 30.0

    with TestClient(app) as c:
        with c.websocket_connect("/ws/session?mock=1") as ws:
            msg = json.loads(ws.receive_text())
            assert msg["type"] == "error"
            assert "Daily STT budget exceeded" in msg["message"]
