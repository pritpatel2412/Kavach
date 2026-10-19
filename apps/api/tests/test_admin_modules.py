"""Unit tests for Phase A8 remaining admin modules: Households, Devices, False-Alarm Queue, Credits, Detector Versions, Changelog, Feature Flags, Data Rights, System Health, and Settings."""
import time
from datetime import datetime, timezone

import pyotp
import pytest
from fastapi.testclient import TestClient

from app import admin_auth, admin_cli, db
from app.main import app
from app.signed_token import create_action_token
from scripts.seed_demo_data import seed_demo_data


@pytest.fixture(autouse=True)
def setup_modules_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_modules.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai")
    monkeypatch.setenv("ENV", "test")
    db.init_db()
    admin_cli.bootstrap_totp("owner@kavach.ai")
    seed_demo_data(clean=False)
    yield


def _login_owner(client: TestClient) -> tuple[dict, str, pyotp.TOTP]:
    with db.db() as conn:
        cursor = conn.execute("SELECT totp_secret_enc FROM admin_users WHERE email = 'owner@kavach.ai';")
        enc = cursor.fetchone()[0]
    secret = admin_auth.decrypt_totp_secret(enc)
    totp = pyotp.TOTP(secret)

    temp_token = create_action_token("owner@kavach.ai", purpose="admin_totp_step", ttl_s=300)
    res = client.post("/admin-api/auth/verify-totp", json={"temp_token": temp_token, "code": totp.now()})
    assert res.status_code == 200
    cookies = {admin_auth.COOKIE_NAME: res.cookies[admin_auth.COOKIE_NAME]}
    csrf_token = res.json()["csrf_token"]
    return cookies, csrf_token, totp


def test_households_and_devices_management():
    """Verify households list, detail, suspend/restore, and device revocation."""
    client = TestClient(app)
    cookies, csrf_token, totp = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    # 1. List households
    r_hh = client.get("/admin-api/households", headers=headers)
    assert r_hh.status_code == 200
    hh_list = r_hh.json()["households"]
    assert len(hh_list) > 0
    target_hh = hh_list[0]["household_id"]

    # 2. Suspend without step-up -> 403 step_up_required
    r_susp_fail = client.post(f"/admin-api/households/{target_hh}/suspend", json={"reason": "Suspicious login"}, headers=headers)
    assert r_susp_fail.status_code == 403

    # Step-up
    client.post("/admin-api/auth/step-up", headers=headers, json={"totp_code": totp.now()})

    # Suspend succeeds
    r_susp_ok = client.post(f"/admin-api/households/{target_hh}/suspend", json={"reason": "Suspicious login"}, headers=headers)
    assert r_susp_ok.status_code == 200
    assert r_susp_ok.json()["status"] == "suspended"

    # Restore succeeds
    r_rest_ok = client.post(f"/admin-api/households/{target_hh}/restore", headers=headers)
    assert r_rest_ok.status_code == 200
    assert r_rest_ok.json()["status"] == "active"

    # 3. Devices list and revocation
    r_dev = client.get("/admin-api/devices", headers=headers)
    assert r_dev.status_code == 200
    dev_list = r_dev.json()["devices"]
    assert len(dev_list) > 0
    target_dev = dev_list[0]["device_id"]

    r_revk = client.post(f"/admin-api/devices/{target_dev}/revoke", headers=headers)
    assert r_revk.status_code == 200
    assert r_revk.json()["status"] == "revoked"


def test_false_alarm_review_and_detector_diff():
    """Verify false-alarm review queue flow: submit -> approve -> detector diff update."""
    client = TestClient(app)
    cookies, csrf_token, totp = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    # 1. Submit false alarm review
    r_sub = client.post(
        "/admin-api/alerts/review-queue",
        json={
            "session_id": "demo_sess_1",
            "guardian_id": "demo_hh_1",
            "elder_name": "Ramesh Patel",
            "transcript_excerpt": "transfer karo electric bill",
            "proposed_dictionary_phrase": "mahavitaran electric bill payment",
        },
        headers=headers,
    )
    assert r_sub.status_code == 200
    rev_id = r_sub.json()["review_id"]

    # 2. Resolve review (approve)
    r_res = client.post(
        f"/admin-api/alerts/review-queue/{rev_id}/resolve",
        json={"verdict": "approved", "resolution_notes": "Added exception for Mahavitaran utility"},
        headers=headers,
    )
    assert r_res.status_code == 200
    assert r_res.json()["verdict"] == "approved"

    # 3. Detector diff shows the staged addition
    r_diff = client.get("/admin-api/detector/diff", headers=headers)
    assert r_diff.status_code == 200
    diff_data = r_diff.json()
    assert "mahavitaran electric bill payment" in diff_data["staged_additions"]

    # 4. Detector versions check
    r_ver = client.get("/admin-api/detector/versions", headers=headers)
    assert r_ver.status_code == 200
    assert "scam_stages" in r_ver.json()


def test_credits_ledger_and_cooling_period():
    """Verify credits adjustments require step-up and enforce 10-minute cooling period."""
    client = TestClient(app)
    cookies, csrf_token, totp = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    # Step-up
    client.post("/admin-api/auth/step-up", headers=headers, json={"totp_code": totp.now()})

    # First adjustment succeeds
    r_adj1 = client.post(
        "/admin-api/credits/adjust",
        json={"household_id": "demo_hh_1", "amount_minutes": 60, "reason": "Customer care goodwill bonus"},
        headers=headers,
    )
    assert r_adj1.status_code == 200
    assert r_adj1.json()["amount_minutes"] == 60

    # Immediate second adjustment on same household fails with 429 cooling period
    r_adj2 = client.post(
        "/admin-api/credits/adjust",
        json={"household_id": "demo_hh_1", "amount_minutes": 30, "reason": "Duplicate attempt"},
        headers=headers,
    )
    assert r_adj2.status_code == 429
    assert "cooling period" in r_adj2.json()["detail"].lower()


def test_changelog_rss_and_feature_flags():
    """Verify changelog creation, public RSS XML endpoint, and feature flag management."""
    client = TestClient(app)
    cookies, csrf_token, _ = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    # 1. Create changelog entry
    r_chg = client.post(
        "/admin-api/content/changelog",
        json={"version": "v1.2.0", "title": "Enhanced Gujrati Voice Warning Model", "description": "High fidelity cloned warning clips with regional dialects.", "category": "release"},
        headers=headers,
    )
    assert r_chg.status_code == 200

    # 2. Public changelog API and RSS
    r_pub_chg = client.get("/api/changelog")
    assert r_pub_chg.status_code == 200
    assert len(r_pub_chg.json()["entries"]) > 0

    r_rss = client.get("/api/changelog/rss")
    assert r_rss.status_code == 200
    assert "application/rss+xml" in r_rss.headers["content-type"]
    assert b"<rss version=\"2.0\">" in r_rss.content

    # 3. Feature flags
    r_flags = client.get("/admin-api/feature-flags", headers=headers)
    assert r_flags.status_code == 200
    flags = r_flags.json()["flags"]
    assert len(flags) > 0

    # Toggle flag
    r_tog = client.patch(f"/admin-api/feature-flags/{flags[0]['name']}", json={"enabled": 1}, headers=headers)
    assert r_tog.status_code == 200
    assert r_tog.json()["enabled"] is True


def test_data_rights_queue_and_erasure():
    """Verify DPDP/GDPR access and erasure requests with SLA timer and step-up processing."""
    client = TestClient(app)
    cookies, csrf_token, totp = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    # 1. Submit request
    r_dr = client.post(
        "/admin-api/data-rights",
        json={"request_type": "erasure", "requester_email": "privacy_user@example.com", "household_id": "demo_hh_3", "notes": "Elders request right to be forgotten"},
        headers=headers,
    )
    assert r_dr.status_code == 200
    req_id = r_dr.json()["request_id"]
    assert r_dr.json()["status"] == "pending"

    # 2. Process without step-up -> 403
    r_proc_fail = client.post(f"/admin-api/data-rights/{req_id}/process", headers=headers)
    assert r_proc_fail.status_code == 403

    # Step-up
    client.post("/admin-api/auth/step-up", headers=headers, json={"totp_code": totp.now()})

    # Process succeeds
    r_proc_ok = client.post(f"/admin-api/data-rights/{req_id}/process", headers=headers)
    assert r_proc_ok.status_code == 200
    assert r_proc_ok.json()["status"] == "completed"


def test_system_health_and_safe_settings():
    """Verify system health endpoint and non-secret settings view."""
    client = TestClient(app)
    cookies, csrf_token, _ = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000"}

    # Health
    r_health = client.get("/admin-api/system/health", headers=headers)
    assert r_health.status_code == 200
    h = r_health.json()
    assert h["status"] == "healthy"
    assert "database" in h
    assert "queues" in h

    # Non-secret settings
    r_set = client.get("/admin-api/settings", headers=headers)
    assert r_set.status_code == 200
    s = r_set.json()
    assert "brand_name" in s
    assert "admin_origin" in s
    # Ensure zero secrets leaked
    assert "secret_key" not in s
    assert "gnani_api_key" not in s
    assert "smtp_pass" not in s
