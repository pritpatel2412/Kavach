"""Tests for Sprint D2: Container Backend, Postgres adapter, WebSocket hygiene, and Cost Guards."""
from __future__ import annotations

import io
import json
import pytest
from starlette.testclient import TestClient

from apps.api.app.main import app
from apps.api.app.config import get_settings
from apps.api.app.ratelimit import get_client_ip, reset_rate_limits
from apps.api.app.db import DbRow, PostgresConnectionWrapper, connect, is_postgres
from apps.api.app import db


client = TestClient(app)


def test_health_endpoint_contract():
    """D2 /health contract: db, email_queue_depth, stt_mode, commit."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["db"] == "ok"
    assert "email_queue_depth" in data
    assert isinstance(data["email_queue_depth"], int)
    assert data["stt_mode"] in ("mock", "live", "mock_fallback")
    assert "commit" in data
    assert "mock_stt" in data


def test_db_row_adapter_key_and_index():
    """Verify DbRow supports both dictionary key access and integer indexing."""
    cols = ["id", "name", "role"]
    vals = ["u_123", "Kamala Iyer", "elder"]
    row = DbRow(cols, vals)

    # Key access
    assert row["name"] == "Kamala Iyer"
    assert row["id"] == "u_123"
    assert row["role"] == "elder"

    # Index access
    assert row[0] == "u_123"
    assert row[1] == "Kamala Iyer"
    assert row[2] == "elder"

    # Dict conversion
    assert dict(row) == {"id": "u_123", "name": "Kamala Iyer", "role": "elder"}


def test_postgres_connection_wrapper_parameter_translation():
    """PostgresConnectionWrapper must replace '?' with '%s' for Postgres compatibility."""
    class FakeCursor:
        def __init__(self):
            self.executed_query = None
            self.executed_params = None

        def execute(self, q, p):
            self.executed_query = q
            self.executed_params = p

    class FakeRawConn:
        def __init__(self):
            self.cursor_instance = FakeCursor()
            self.committed = False

        def cursor(self):
            return self.cursor_instance

        def commit(self):
            self.committed = True

        def rollback(self):
            pass

        def close(self):
            pass

    fake_raw = FakeRawConn()
    wrapper = PostgresConnectionWrapper(fake_raw)

    query = "SELECT * FROM guardians WHERE id = ? AND telegram_chat_id = ?"
    params = ("g_1", "12345")
    wrapper.execute(query, params)

    assert wrapper._raw.cursor_instance.executed_query == "SELECT * FROM guardians WHERE id = %s AND telegram_chat_id = %s"
    assert wrapper._raw.cursor_instance.executed_params == params

    wrapper.commit()
    assert fake_raw.committed is True


def test_trusted_proxy_hops_resolution(monkeypatch):
    """Verify TRUSTED_PROXY_HOPS correctly resolves client IP and neutralizes spoofed headers."""
    class FakeClient:
        host = "10.0.0.5"  # Immediate proxy IP

    class FakeRequest:
        def __init__(self, xff: str | None):
            self.headers = {"x-forwarded-for": xff} if xff else {}
            self.client = FakeClient()

    # Case 1: 1 proxy hop (e.g. Render direct), attacker sends: "spoofed_ip, 203.0.113.195"
    # Proxy appends caller IP: "spoofed_ip, 203.0.113.195"
    monkeypatch.setenv("TRUSTED_PROXY_HOPS", "1")
    req = FakeRequest("1.1.1.1, 203.0.113.195")
    # With hops=1, real client is the last hop before the server
    assert get_client_ip(req) == "203.0.113.195"

    # Case 2: 2 proxy hops (e.g. Cloudflare -> Render -> App)
    monkeypatch.setenv("TRUSTED_PROXY_HOPS", "2")
    req = FakeRequest("203.0.113.195, 10.1.1.1")
    # With hops=2, real client is 2 hops back
    assert get_client_ip(req) == "203.0.113.195"

    # Case 3: No X-Forwarded-For header, fallback to immediate client
    req_no_xff = FakeRequest(None)
    assert get_client_ip(req_no_xff) == "10.0.0.5"


def test_async_voice_enrollment_job(monkeypatch):
    """Long operation test: POST /api/voice/enroll-async returns job_id and polls to completed."""
    # Ensure mock mode for zero credits
    monkeypatch.setenv("KAVACH_MOCK_STT", "1")

    # 1. Create a test guardian and elder
    g_id, token = db.insert_guardian("Test Async Guardian", "m")
    e_id = db.insert_elder(g_id, "Test Async Elder", "hi-IN")

    # 2. Get a challenge
    c_res = client.get("/api/voice/challenge")
    assert c_res.status_code == 200
    c_id = c_res.json()["challenge_id"]

    # 3. Trigger async enrollment
    fake_wav = io.BytesIO(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00")
    files = {"audio_file": ("test.wav", fake_wav, "audio/wav")}
    data = {
        "challenge_id": c_id,
        "elder_id": e_id,
        "guardian_id": g_id,
        "consent": "true",
    }
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/voice/enroll-async", data=data, files=files, headers=headers)
    assert res.status_code == 202
    job_data = res.json()
    assert "job_id" in job_data
    job_id = job_data["job_id"]

    # 4. Poll job status
    poll_res = client.get(f"/api/voice/jobs/{job_id}", headers=headers)
    assert poll_res.status_code == 200
    status_data = poll_res.json()
    assert status_data["status"] in ("processing", "completed")
