"""Unit tests for Sprint D8: Demo Sandbox ephemeral household generation."""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import pytest
from starlette.testclient import TestClient

from apps.api.app.main import app
from apps.api.app import db
from apps.api.app.routes_demo_sandbox import _active_sandboxes, cleanup_expired_sandboxes
from apps.api.app.ratelimit import reset_rate_limits

client = TestClient(app)


@pytest.fixture(autouse=True)
def _reset_sandbox():
    reset_rate_limits()
    _active_sandboxes.clear()
    yield
    reset_rate_limits()
    _active_sandboxes.clear()


def test_create_demo_sandbox_success():
    res = client.post("/api/demo/sandbox")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["guardian_id"].startswith("g_sb_")
    assert data["elder_id"].startswith("e_sb_")
    assert data["token"].startswith("sb_tok_")
    assert data["expires_in_seconds"] == 7200
    assert "/app?demo_token=" in data["app_url"]
    assert "/app/elder?sandbox=1" in data["tablet_url"]

    # Verify seeded database records
    with db.db() as conn:
        g = conn.execute("SELECT name FROM guardians WHERE id = ?", (data["guardian_id"],)).fetchone()
        assert g is not None
        assert "Sandbox" in g[0]

        e = conn.execute("SELECT name, language FROM elders WHERE id = ?", (data["elder_id"],)).fetchone()
        assert e is not None
        assert e[0] == "Kamala-ji"
        assert e[1] == "hi-IN"

        sessions = conn.execute("SELECT id, max_level FROM sessions WHERE elder_id = ?", (data["elder_id"],)).fetchall()
        assert len(sessions) == 3


def test_create_demo_sandbox_rate_limit():
    for _ in range(5):
        r = client.post("/api/demo/sandbox")
        assert r.status_code == 200

    # 6th request within the hour must fail with 429
    r6 = client.post("/api/demo/sandbox")
    assert r6.status_code == 429
    assert r6.json()["detail"]["error"] == "rate_limited"


def test_cleanup_expired_sandboxes():
    res = client.post("/api/demo/sandbox")
    assert res.status_code == 200
    gid = res.json()["guardian_id"]

    # Backdate expiration
    past_iso = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    _active_sandboxes[gid]["expires_at"] = past_iso

    purged = cleanup_expired_sandboxes()
    assert purged == 1
    assert gid not in _active_sandboxes

    # Verify database records purged
    with db.db() as conn:
        assert conn.execute("SELECT COUNT(*) FROM guardians WHERE id = ?", (gid,)).fetchone()[0] == 0
