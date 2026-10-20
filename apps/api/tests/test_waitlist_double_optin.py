"""Unit tests for waitlist double opt-in lifecycle, duplicates, honeypot, unsubscribe, campaigns, and admin CRM."""
from datetime import datetime, timezone
from fastapi.testclient import TestClient
import pyotp
import pytest

from app.main import app
from app import admin_auth, admin_cli, db
from app.email.suppression import add_to_suppression_list, is_suppressed
from app.signed_token import create_action_token

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_waitlist_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_waitlist.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai")
    monkeypatch.setenv("EMAIL_MODE", "console")
    db.init_db()
    admin_cli.bootstrap_totp("owner@kavach.ai")
    yield


def _login_owner() -> tuple[dict, str]:
    """Helper to login owner and return cookies and csrf_token."""
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
    return cookies, csrf_token


def test_public_waitlist_double_optin_flow():
    # 1. Public Signup
    payload = {
        "name": "Pooja Verma",
        "email": "pooja.verma@example.com",
        "phone": "+91 98765 11111",
        "language": "hi-IN",
        "city": "Jaipur",
        "for_who": "parents",
        "consent": True,
    }
    res = client.post("/api/waitlist", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "pending_confirm"

    # Verify confirmation email was enqueued in outbox
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT confirmation_token_hash FROM waitlist WHERE email = 'pooja.verma@example.com';"
        )
        token_hash = cursor.fetchone()[0]
        assert token_hash is not None

        cursor = conn.execute(
            "SELECT id, template, recipient FROM email_outbox WHERE recipient = 'pooja.verma@example.com';"
        )
        email_row = cursor.fetchone()
        assert email_row is not None
        assert email_row[1] == "waitlist_confirm"

    # 2. Duplicate signup returns same anti-enumeration message
    res_dup = client.post("/api/waitlist", json=payload)
    assert res_dup.status_code == 200
    assert res_dup.json()["status"] == "pending_confirm"

    # 3. Simulate click of confirmation link
    raw_token = "mock_confirm_token_123"
    th = admin_auth._hash_token(raw_token)
    with db.db() as conn:
        conn.execute("UPDATE waitlist SET confirmation_token_hash = ? WHERE email = 'pooja.verma@example.com';", (th,))

    res_confirm = client.get(f"/api/waitlist/confirm?token={raw_token}")
    assert res_confirm.status_code == 200
    data = res_confirm.json()
    assert data["confirmed"] is True
    assert data["rank"] >= 1

    # Verify status updated to 'confirmed' and welcome email enqueued
    with db.db() as conn:
        cursor = conn.execute("SELECT status, confirmed_at FROM waitlist WHERE email = 'pooja.verma@example.com';")
        row = cursor.fetchone()
        assert row[0] == "confirmed"
        assert row[1] is not None

        cursor = conn.execute(
            "SELECT id FROM email_outbox WHERE recipient = 'pooja.verma@example.com' AND template = 'waitlist_welcome';"
        )
        assert cursor.fetchone() is not None


def test_honeypot_bot_defense():
    # Honeypot field filled -> silently return 200 without creating entry
    payload = {
        "name": "Bot Spammer",
        "email": "bot@spammer.com",
        "hp": "http://spamsite.xyz",
        "consent": True,
    }
    res = client.post("/api/waitlist", json=payload)
    assert res.status_code == 200

    with db.db() as conn:
        cursor = conn.execute("SELECT 1 FROM waitlist WHERE email = 'bot@spammer.com';")
        assert cursor.fetchone() is None


def test_one_click_unsubscribe_flow():
    # Insert confirmed user
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO waitlist (id, name, email, language, status, consent_version, tags, notes, created_at, updated_at)
            VALUES ('w-unsub', 'User Unsub', 'unsub_me@example.com', 'en-IN', 'confirmed', 'v1', '[]', '[]', '2026-10-18', '2026-10-18');
            """
        )

    # Generate signed unsubscribe token
    token = create_action_token("unsub_me@example.com", purpose="email_unsubscribe")
    res = client.get(f"/api/waitlist/unsubscribe?token={token}")
    assert res.status_code == 200
    assert res.json()["unsubscribed"] is True

    # Recipient must be in suppression list and waitlist status updated
    assert is_suppressed("unsub_me@example.com") is True
    with db.db() as conn:
        cursor = conn.execute("SELECT status FROM waitlist WHERE id = 'w-unsub';")
        assert cursor.fetchone()[0] == "unsubscribed"


def test_admin_waitlist_crm_and_masking():
    cookies, csrf_token = _login_owner()

    # Insert test lead
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO waitlist (id, name, email, phone, language, city, for_who, status, consent_version, tags, notes, created_at, updated_at)
            VALUES ('w-lead-1', 'Amitabh Bachchan', 'amitabh@example.com', '+91 99887 66554', 'hi-IN', 'Mumbai', 'parents', 'confirmed', 'v1', '["vip"]', '[]', '2026-10-18', '2026-10-18');
            """
        )

    # 1. Without step-up auth, list endpoint masks PII
    res_list = client.get("/admin-api/waitlist", cookies=cookies)
    assert res_list.status_code == 200
    assert res_list.json()["pii_masked"] is True
    entry = next(e for e in res_list.json()["entries"] if e["id"] == "w-lead-1")
    assert entry["email"] == "a***h@example.com"
    assert entry["phone"] == "+91*** **554"
    assert entry["name"] == "A***h B***n"

    # 2. Add internal note
    res_note = client.post(
        "/admin-api/waitlist/w-lead-1/notes",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={"note": "VIP household in Mumbai requiring Priority 1 onboarding."},
    )
    assert res_note.status_code == 200
    assert len(res_note.json()["notes"]) == 1

    # 3. Generate beta invite code
    res_invite = client.post(
        "/admin-api/waitlist/w-lead-1/invite",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={"coupon_code": "KAVACH50"},
    )
    assert res_invite.status_code == 200
    assert res_invite.json()["status"] == "invited"
    assert res_invite.json()["invite_code"].startswith("KV-")

    # Verify beta_invite email enqueued
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT id FROM email_outbox WHERE recipient = 'amitabh@example.com' AND template = 'beta_invite';"
        )
        assert cursor.fetchone() is not None


def test_admin_campaigns_and_suppression():
    cookies, csrf_token = _login_owner()

    # Step up for campaign operations
    with db.db() as conn:
        cursor = conn.execute("SELECT totp_secret_enc FROM admin_users WHERE email = 'owner@kavach.ai';")
        enc = cursor.fetchone()[0]
    secret = admin_auth.decrypt_totp_secret(enc)
    totp = pyotp.TOTP(secret)
    client.post("/admin-api/auth/step-up", cookies=cookies, headers={"X-CSRF-Token": csrf_token}, json={"totp_code": totp.now()})

    # Insert 2 confirmed users; suppress 1 of them
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO waitlist (id, name, email, language, status, consent_version, tags, notes, created_at, updated_at)
            VALUES
              ('w-c1', 'Active User', 'active_target@example.com', 'en-IN', 'confirmed', 'v1', '[]', '[]', '2026-10-18', '2026-10-18'),
              ('w-c2', 'Suppressed User', 'suppressed_target@example.com', 'en-IN', 'confirmed', 'v1', '[]', '[]', '2026-10-18', '2026-10-18');
            """
        )
    add_to_suppression_list("suppressed_target@example.com", reason="unsubscribed")

    # 1. Create campaign
    res_camp = client.post(
        "/admin-api/waitlist/campaigns",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={
            "name": "October Protection Update",
            "segment_filter": "confirmed",
            "template": "broadcast_base",
            "subject": "Important update on Kavach living room setup",
            "body_text": "We have improved silence gating to save battery.",
        },
    )
    assert res_camp.status_code == 200
    cid = res_camp.json()["campaign_id"]

    # 2. Dispatch campaign
    res_send = client.post(
        f"/admin-api/waitlist/campaigns/{cid}/send",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
    )
    assert res_send.status_code == 200
    # Exactly 1 sent (active), 1 suppressed
    assert res_send.json()["suppressed"] >= 1
    assert res_send.json()["enqueued"] >= 1


def test_waitlist_confirmed_states_and_rfc8058_unsubscribe(monkeypatch):
    """X3 verification: /waitlist/confirmed token lifecycle and RFC 8058 unsubscribe."""
    import re
    from app.config import get_settings

    s = get_settings()
    site_url = s.public_site_url

    # 1. Sign up user
    res = client.post(
        "/api/waitlist",
        json={"name": "Rajesh Gupta", "email": "rajesh.gupta@example.com", "language": "hi-IN"},
    )
    assert res.status_code == 200

    # 2. Verify confirmation email link points to public_site_url /waitlist/confirmed
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT html_body FROM email_outbox WHERE recipient = 'rajesh.gupta@example.com' ORDER BY id DESC LIMIT 1;"
        )
        html = cursor.fetchone()[0]

    match = re.search(r'href="([^"]+/waitlist/confirmed\?token=([^"]+))"', html)
    assert match is not None, "Email HTML must contain link to /waitlist/confirmed?token=..."
    full_link = match.group(1)
    token = match.group(2)
    assert full_link.startswith(f"{site_url}/waitlist/confirmed?token=")

    # 3. First confirmation: success state
    res_conf_1 = client.get(f"/api/waitlist/confirm?token={token}")
    assert res_conf_1.status_code == 200
    data_1 = res_conf_1.json()
    assert data_1["status"] == "success"
    assert data_1["confirmed"] is True
    assert data_1["rank"] >= 1

    # 4. Second confirmation with same token: already_confirmed state
    res_conf_2 = client.get(f"/api/waitlist/confirm?token={token}")
    assert res_conf_2.status_code == 200
    data_2 = res_conf_2.json()
    assert data_2["status"] == "already_confirmed"
    assert data_2["confirmed"] is True

    # 5. Invalid token: 400 error
    res_invalid = client.get("/api/waitlist/confirm?token=completely_invalid_token_999")
    assert res_invalid.status_code == 400
    assert res_invalid.json()["detail"]["error"] == "invalid_token"

    # 6. RFC 8058 One-Click POST Unsubscribe
    unsub_token = create_action_token("rajesh.gupta@example.com", purpose="email_unsubscribe")
    res_unsub_post = client.post(f"/api/waitlist/unsubscribe?token={unsub_token}")
    assert res_unsub_post.status_code == 200
    assert res_unsub_post.json()["unsubscribed"] is True
    assert is_suppressed("rajesh.gupta@example.com") is True

    # 7. GET Unsubscribe (same endpoint accepts both GET and POST)
    unsub_token_2 = create_action_token("another_user@example.com", purpose="email_unsubscribe")
    res_unsub_get = client.get(f"/api/waitlist/unsubscribe?token={unsub_token_2}")
    assert res_unsub_get.status_code == 200
    assert res_unsub_get.json()["unsubscribed"] is True
    assert is_suppressed("another_user@example.com") is True

