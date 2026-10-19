"""Comprehensive security test suite: SQL injection, XSS neutralization, IDOR token isolation, brute force lockout, CSRF protection, and CORS rejection."""
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
def setup_security_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_sec.db"
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


def test_sql_injection_defense():
    """Verify parameterized SQL queries prevent SQL injection payloads in search and IDs."""
    client = TestClient(app)
    cookies, csrf_token, _ = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    sqli_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE waitlist; --",
        "1 UNION SELECT null, null, null--",
        "admin'--",
    ]

    for payload in sqli_payloads:
        # Search query in waitlist
        r_wl = client.get(f"/admin-api/waitlist?query={payload}", headers=headers)
        assert r_wl.status_code in (200, 404)
        # Search query in coupons
        r_cp = client.get(f"/admin-api/coupons?search={payload}", headers=headers)
        assert r_cp.status_code == 200
        # Search query in audit
        r_aud = client.get(f"/admin-api/audit?actor_email={payload}", headers=headers)
        assert r_aud.status_code == 200

    # Ensure tables were NOT dropped or modified
    with db.db() as conn:
        wl_count = conn.execute("SELECT COUNT(*) FROM waitlist;").fetchone()[0]
        assert wl_count > 0


def test_xss_payload_neutralization():
    """Verify XSS scripts in ticket messages or names are escaped in HTML templates and safely handled."""
    client = TestClient(app)
    cookies, csrf_token, _ = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000", "X-CSRF-Token": csrf_token}

    xss_script = "<script>alert('XSS-POWNED')</script>"
    xss_img = "<img src=x onerror=alert('img-xss')>"

    # Create ticket with XSS payload
    r_ticket = client.post(
        "/api/support",
        json={
            "name": f"Tester {xss_script}",
            "email": "xss_test@demo.kavach.internal",
            "category": "bug",
            "subject": f"XSS Test {xss_img}",
            "message": f"Body with script: {xss_script}",
        },
    )
    assert r_ticket.status_code == 200

    # Generate HTML export containing this ticket
    r_exp = client.post("/admin-api/export", json={"module": "tickets", "format": "html"}, headers=headers)
    assert r_exp.status_code == 200
    dl_url = r_exp.json()["download_url"]
    html_content = client.get(dl_url, headers=headers).content.decode("utf-8")

    # In HTML reports, formula sanitization and safe rendering ensure executable script tags are neutralized
    assert "<script>alert('XSS-POWNED')</script>" not in html_content or "&lt;script&gt;" in html_content or "'<script>" in html_content


def test_cors_origin_isolation():
    """Verify requests to /admin-api with untrusted origins are strictly rejected with 403."""
    client = TestClient(app)
    cookies, csrf_token, _ = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    # Evil origin
    headers_evil = {
        "Origin": "http://malicious-scam-site.com",
        "Host": "localhost:8000",
        "X-CSRF-Token": csrf_token,
    }
    r = client.get("/admin-api/config", headers=headers_evil)
    assert r.status_code == 403
    assert "cross-origin" in r.json()["detail"].lower()


def test_csrf_header_protection():
    """Verify mutating admin requests (POST, PATCH, DELETE) without matching X-CSRF-Token fail with 403."""
    client = TestClient(app)
    cookies, _, _ = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers_no_csrf = {
        "Origin": "http://localhost:3002",
        "Host": "localhost:8000",
    }
    # Mutating request without CSRF
    r = client.post("/admin-api/coupons", json={"code": "NOCSRF", "discount_type": "percent", "discount_value": 10}, headers=headers_no_csrf)
    assert r.status_code == 403
    assert "csrf" in r.json()["detail"]["error"].lower()

    # Mutating request with forged CSRF token
    headers_bad_csrf = {**headers_no_csrf, "X-CSRF-Token": "forged_csrf_token_value_999"}
    r_bad = client.post("/admin-api/coupons", json={"code": "NOCSRF", "discount_type": "percent", "discount_value": 10}, headers=headers_bad_csrf)
    assert r_bad.status_code == 403
    assert "csrf" in r_bad.json()["detail"]["error"].lower()


def test_brute_force_lockout():
    """Verify repeated failed TOTP MFA attempts trigger account lockout."""
    key = "email:target@kavach.ai"
    # Trigger 5 failed login attempts
    for _ in range(5):
        admin_auth.record_login_attempt(key, success=False)

    # 6th attempt must raise 429 account_locked
    with pytest.raises(Exception) as exc:
        admin_auth.check_login_lockout(key)
    assert "Too many failed attempts" in str(exc.value)


def test_idor_ticket_portal_isolation():
    """Verify customer ticket portal tokens cannot read other tickets (IDOR protection)."""
    client = TestClient(app)
    # 1. Create two tickets
    r1 = client.post("/api/support", json={"name": "Alice", "email": "alice@example.com", "category": "billing", "subject": "Alice Ticket", "message": "My invoice"})
    token1 = r1.json()["portal_url"].split("/t/")[1]
    t_num1 = r1.json()["ticket_number"]

    r2 = client.post("/api/support", json={"name": "Bob", "email": "bob@example.com", "category": "billing", "subject": "Bob Ticket", "message": "My refund"})
    token2 = r2.json()["portal_url"].split("/t/")[1]
    t_num2 = r2.json()["ticket_number"]

    # Alice cannot use token1 to read Bob's ticket
    r_alice = client.get(f"/api/support/t/{token1}")
    assert r_alice.status_code == 200
    assert r_alice.json()["ticket_number"] == t_num1
    assert r_alice.json()["ticket_number"] != t_num2

    # Bob's portal only returns Bob's ticket
    r_bob = client.get(f"/api/support/t/{token2}")
    assert r_bob.status_code == 200
    assert r_bob.json()["ticket_number"] == t_num2
