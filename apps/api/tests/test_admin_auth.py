"""Unit tests for admin passwordless magic link, TOTP via pyotp, sessions, CSRF, and step-up auth."""
import time
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
import pyotp
import pytest

from app import admin_auth, admin_cli, db
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_admin_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_admin.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai,agent@kavach.ai")
    db.init_db()

    # Bootstrap owner
    admin_cli.bootstrap_totp("owner@kavach.ai")
    yield


def _get_totp_secret(email: str) -> str:
    with db.db() as conn:
        cursor = conn.execute("SELECT totp_secret_enc FROM admin_users WHERE email = ?;", (email,))
        enc = cursor.fetchone()[0]
    return admin_auth.decrypt_totp_secret(enc)


def test_magic_link_anti_enumeration():
    # Allowlisted existing user
    res1 = client.post("/admin-api/auth/magic-link", json={"email": "owner@kavach.ai"})
    assert res1.status_code == 200
    msg1 = res1.json()["message"]

    # Unknown, non-allowlisted email
    res2 = client.post("/admin-api/auth/magic-link", json={"email": "attacker@evil.com"})
    assert res2.status_code == 200
    msg2 = res2.json()["message"]

    # Both must return identical anti-enumeration message
    assert msg1 == msg2


def test_magic_link_single_use_and_totp_login():
    # 1. Request magic link
    client.post("/admin-api/auth/magic-link", json={"email": "owner@kavach.ai"})

    # Extract token hash and raw token from DB
    with db.db() as conn:
        cursor = conn.execute("SELECT token_hash FROM admin_magic_tokens WHERE email = 'owner@kavach.ai' ORDER BY created_at DESC LIMIT 1;")
        token_hash = cursor.fetchone()[0]

    # For testing, we know token verification checks sha256(raw_token) == token_hash.
    # Let's create a known raw token directly in DB
    raw_token = "test_raw_magic_token_12345"
    th = admin_auth._hash_token(raw_token)
    expires = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    with db.db() as conn:
        conn.execute(
            "INSERT INTO admin_magic_tokens (token_hash, email, expires_at, used, created_at) VALUES (?, 'owner@kavach.ai', ?, 0, ?);",
            (th, expires, datetime.now(timezone.utc).isoformat()),
        )

    # 2. Verify magic link
    res_verify = client.post("/admin-api/auth/verify-magic-link", json={"token": raw_token})
    assert res_verify.status_code == 200
    temp_token = res_verify.json()["temp_token"]
    assert res_verify.json()["requires_totp"] is True

    # 3. Attempt reuse of same magic link -> must be rejected
    res_reuse = client.post("/admin-api/auth/verify-magic-link", json={"token": raw_token})
    assert res_reuse.status_code == 400
    assert "already been used" in res_reuse.json()["detail"]["message"]

    # 4. Attempt TOTP with bad code
    res_bad_totp = client.post("/admin-api/auth/verify-totp", json={"temp_token": temp_token, "code": "000000"})
    assert res_bad_totp.status_code == 401

    # 5. Complete TOTP with valid pyotp code
    secret = _get_totp_secret("owner@kavach.ai")
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()

    res_login = client.post("/admin-api/auth/verify-totp", json={"temp_token": temp_token, "code": valid_code})
    assert res_login.status_code == 200
    data = res_login.json()
    assert data["email"] == "owner@kavach.ai"
    assert data["role"] == "owner"
    assert "csrf_token" in data
    assert admin_auth.COOKIE_NAME in res_login.cookies

    # 6. Check /auth/me with session cookie
    csrf_token = data["csrf_token"]
    client.cookies.set(admin_auth.COOKIE_NAME, res_login.cookies[admin_auth.COOKIE_NAME])
    res_me = client.get("/admin-api/auth/me")
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "owner@kavach.ai"
    assert res_me.json()["step_up_active"] is False

    # 7. Check CSRF enforcement on mutating endpoints
    res_csrf_fail = client.post("/admin-api/auth/logout", headers={"X-CSRF-Token": "bad_token"})
    assert res_csrf_fail.status_code == 403

    res_csrf_success = client.post("/admin-api/auth/logout", headers={"X-CSRF-Token": csrf_token})
    assert res_csrf_success.status_code == 200


def test_step_up_privilege_flow():
    # Login owner
    secret = _get_totp_secret("owner@kavach.ai")
    totp = pyotp.TOTP(secret)

    from app.signed_token import create_action_token
    temp_token = create_action_token("owner@kavach.ai", purpose="admin_totp_step", ttl_s=300)
    res_login = client.post("/admin-api/auth/verify-totp", json={"temp_token": temp_token, "code": totp.now()})
    assert res_login.status_code == 200
    csrf_token = res_login.json()["csrf_token"]
    client.cookies.set(admin_auth.COOKIE_NAME, res_login.cookies[admin_auth.COOKIE_NAME])

    # Privileged PII reveal before step-up -> 403 step_up_required
    res_pii_before = client.post(
        "/admin-api/audit/reveal-pii",
        headers={"X-CSRF-Token": csrf_token},
        json={"entity_type": "household", "entity_id": "hh-1", "reason": "Investigating fraud complaint"},
    )
    assert res_pii_before.status_code == 403
    assert res_pii_before.json()["detail"]["error"] == "step_up_required"

    # Step-up with valid TOTP code
    res_stepup = client.post(
        "/admin-api/auth/step-up",
        headers={"X-CSRF-Token": csrf_token},
        json={"totp_code": totp.now()},
    )
    assert res_stepup.status_code == 200
    assert "step_up_valid_until" in res_stepup.json()

    # Now privileged action must succeed
    res_pii_after = client.post(
        "/admin-api/audit/reveal-pii",
        headers={"X-CSRF-Token": csrf_token},
        json={"entity_type": "household", "entity_id": "hh-1", "reason": "Investigating fraud complaint"},
    )
    assert res_pii_after.status_code == 200
    assert res_pii_after.json()["authorized"] is True


def test_lockout_after_multiple_failed_attempts():
    key = "email:owner@kavach.ai"
    # Trigger 5 failed attempts
    for _ in range(5):
        admin_auth.record_login_attempt(key, success=False)

    # Next attempt must raise 429 account_locked
    with pytest.raises(Exception) as exc:
        admin_auth.check_login_lockout(key)
    assert "Too many failed attempts" in str(exc.value)
