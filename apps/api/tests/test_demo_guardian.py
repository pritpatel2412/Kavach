"""Unit tests for Demo Caregiver credentials, instant demo-login, and demo household data."""
from __future__ import annotations

import pytest
from starlette.testclient import TestClient

from apps.api.app.main import app
from apps.api.app import db

client = TestClient(app)


def test_demo_guardian_login_instant():
    """Verify POST /api/auth/guardian/demo-login instantly yields valid session and demo profile."""
    res = client.post("/api/auth/guardian/demo-login")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["session_id"].startswith("gsess_demo_")
    token = data["token"]
    assert data["guardian"]["email"] == "demo@kavach.ai"
    assert "Vikram Iyer" in data["guardian"]["name"]

    # Test me endpoint
    me_res = client.get("/api/auth/guardian/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["guardian"]["id"] == "g_demo_kavach_caregiver"

    # Test elders endpoint
    elders_res = client.get("/api/elders", headers={"Authorization": f"Bearer {token}"})
    assert elders_res.status_code == 200
    elders = elders_res.json()["elders"]
    assert len(elders) >= 1
    assert any(e["name"] == "Kamala-ji" for e in elders)

    # Test devices endpoint
    dev_res = client.get("/api/devices", headers={"Authorization": f"Bearer {token}"})
    assert dev_res.status_code == 200
    devices = dev_res.json()["devices"]
    assert len(devices) >= 1
    assert any("Living Room Tablet" in d["label"] for d in devices)

    # Test sessions endpoint with rich event data
    sess_res = client.get("/api/sessions", headers={"Authorization": f"Bearer {token}"})
    assert sess_res.status_code == 200
    sessions = sess_res.json()["sessions"]
    assert len(sessions) >= 3
    extortion = next(s for s in sessions if s["id"] == "sess_demo_extortion")
    assert extortion["max_level"] == 3
    assert extortion["max_score"] == 94
    assert "CBI Officer Sharma" in extortion.get("transcript_excerpt", "")
    assert "S1" in extortion.get("stages", [])


def test_demo_guardian_otp_flow():
    """Verify demo phone +91 98765 43210 deterministically produces 123456 and verifies."""
    send_res = client.post("/api/auth/guardian/otp/send", json={"identifier": "+91 98765 43210"})
    assert send_res.status_code == 200
    assert send_res.json()["code"] == "123456"

    verify_res = client.post(
        "/api/auth/guardian/otp/verify",
        json={"identifier": "+91 98765 43210", "otp": "123456"},
    )
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["ok"] is True
    assert data["session_id"].startswith("gsess_demo_")
    assert data["guardian"]["email"] == "demo@kavach.ai"
