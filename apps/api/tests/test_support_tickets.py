"""Unit tests for support ticket intake, customer portal, IDOR security, internal notes, SLAs, CSAT, and merge."""
from datetime import datetime, timezone
from fastapi.testclient import TestClient
import pyotp
import pytest

from app.main import app
from app import admin_auth, admin_cli, db
from app.signed_token import create_action_token

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_support_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_support.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai")
    monkeypatch.setenv("EMAIL_MODE", "console")
    db.init_db()
    admin_cli.bootstrap_totp("owner@kavach.ai")
    yield


def _login_owner() -> tuple[dict, str]:
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


def test_public_ticket_intake_and_emergency_sla():
    # 1. Normal category ticket
    res_norm = client.post(
        "/api/support",
        json={
            "name": "Arun Kumar",
            "email": "arun@example.com",
            "category": "billing",
            "subject": "GST Invoice Query",
            "message": "Need tax invoice for my Plus plan payment.",
        },
    )
    assert res_norm.status_code == 200
    t_num = res_norm.json()["ticket_number"]
    assert t_num.startswith("KAV-")

    # Verify high priority SLA (4h response)
    with db.db() as conn:
        cursor = conn.execute("SELECT priority, sla_first_response_due FROM tickets WHERE ticket_number = ?;", (t_num,))
        prio, due = cursor.fetchone()
        assert prio == "high"

    # 2. Scam emergency ticket: must be 'urgent' with 1h SLA and emergency guidance in email
    res_scam = client.post(
        "/api/support",
        json={
            "name": "Elder Relative",
            "email": "elder_relative@example.com",
            "category": "scam_emergency",
            "subject": "Police digital arrest call right now",
            "message": "They are demanding ₹5 lakhs safe custody deposit.",
        },
    )
    assert res_scam.status_code == 200
    scam_tnum = res_scam.json()["ticket_number"]

    with db.db() as conn:
        cursor = conn.execute("SELECT priority, category FROM tickets WHERE ticket_number = ?;", (scam_tnum,))
        prio, cat = cursor.fetchone()
        assert prio == "urgent"
        assert cat == "scam_emergency"

        # Check that confirmation email had emergency notice
        cursor = conn.execute("SELECT html_body FROM email_outbox WHERE recipient = 'elder_relative@example.com';")
        html = cursor.fetchone()[0]
        assert "PRIORITY SCAM EMERGENCY PROTOCOL" in html
        assert "1930" in html


def test_portal_token_security_and_idor_prevention():
    # Create two distinct tickets
    res1 = client.post(
        "/api/support",
        json={"name": "Alice", "email": "alice@example.com", "category": "bug", "subject": "Alice's Issue", "message": "Secret data of Alice"},
    )
    token1 = res1.json()["portal_url"].split("/t/")[1]

    res2 = client.post(
        "/api/support",
        json={"name": "Bob", "email": "bob@example.com", "category": "feedback", "subject": "Bob's Feedback", "message": "Bob's private note"},
    )
    token2 = res2.json()["portal_url"].split("/t/")[1]

    # Alice accessing with Token 1 can view Alice's ticket
    res_a = client.get(f"/api/support/t/{token1}")
    assert res_a.status_code == 200
    assert "Alice's Issue" in res_a.json()["subject"]

    # Bob accessing with Token 2 can view Bob's ticket
    res_b = client.get(f"/api/support/t/{token2}")
    assert res_b.status_code == 200
    assert "Bob's Feedback" in res_b.json()["subject"]

    from app.signed_token import verify_action_token
    payload1 = verify_action_token(token1, expected_purpose="support_portal")
    payload2 = verify_action_token(token2, expected_purpose="support_portal")
    assert payload1["session_id"] != payload2["session_id"]


    # Invalid / tampered token fails
    res_tampered = client.get("/api/support/t/tampered_token.12345")
    assert res_tampered.status_code == 401


def test_internal_notes_hidden_from_customer():
    cookies, csrf_token = _login_owner()

    # Create ticket
    res_c = client.post(
        "/api/support",
        json={"name": "Rohan", "email": "rohan@example.com", "category": "device_listening", "subject": "Tablet not connecting", "message": "Help me connect"},
    )
    portal_token = res_c.json()["portal_url"].split("/t/")[1]

    with db.db() as conn:
        cursor = conn.execute("SELECT id FROM tickets WHERE requester_email = 'rohan@example.com';")
        ticket_id = cursor.fetchone()[0]

    # 1. Staff adds an INTERNAL note
    client.post(
        f"/admin-api/tickets/{ticket_id}/reply",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={"body": "INTERNAL NOTE: Known router incompatibility; do not offer refund yet.", "is_internal": True},
    )

    # 2. Staff adds a PUBLIC reply
    client.post(
        f"/admin-api/tickets/{ticket_id}/reply",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={"body": "Hello Rohan, please restart the tablet while plugged in.", "is_internal": False},
    )

    # 3. Customer portal: MUST show public reply, but MUST NOT show internal note!
    res_portal = client.get(f"/api/support/t/{portal_token}")
    assert res_portal.status_code == 200
    messages = res_portal.json()["messages"]
    assert len(messages) == 2  # Original customer message + 1 public staff reply
    body_texts = [m["body"] for m in messages]
    assert "please restart the tablet" in body_texts[1]
    assert not any("INTERNAL NOTE" in b for b in body_texts)

    # 4. Admin detail: MUST show all messages including internal note
    res_admin = client.get(f"/admin-api/tickets/{ticket_id}", cookies=cookies)
    assert res_admin.status_code == 200
    admin_msgs = res_admin.json()["messages"]
    assert len(admin_msgs) == 3
    assert any(m["is_internal"] is True for m in admin_msgs)


def test_customer_reply_reopens_solved_ticket_and_csat():
    cookies, csrf_token = _login_owner()

    res_t = client.post(
        "/api/support",
        json={"name": "Kiran", "email": "kiran@example.com", "category": "billing", "subject": "Invoice issue", "message": "Need invoice"},
    )
    portal_token = res_t.json()["portal_url"].split("/t/")[1]

    with db.db() as conn:
        cursor = conn.execute("SELECT id FROM tickets WHERE requester_email = 'kiran@example.com';")
        tid = cursor.fetchone()[0]

    # Admin marks solved -> dispatches CSAT email
    client.patch(
        f"/admin-api/tickets/{tid}",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={"status": "solved"},
    )
    with db.db() as conn:
        cursor = conn.execute("SELECT status FROM tickets WHERE id = ?;", (tid,))
        assert cursor.fetchone()[0] == "solved"

    # Customer submits CSAT rating 5
    res_csat = client.post(f"/api/support/t/{portal_token}/csat", json={"rating": 5, "feedback": "Fast resolution, thank you!"})
    assert res_csat.status_code == 200

    with db.db() as conn:
        cursor = conn.execute("SELECT csat_rating, csat_feedback FROM tickets WHERE id = ?;", (tid,))
        r, f = cursor.fetchone()
        assert r == 5
        assert "Fast resolution" in f

    # Customer later sends another message -> ticket automatically reopens
    client.post(f"/api/support/t/{portal_token}/reply", json={"message": "Wait, I found one more question."})
    with db.db() as conn:
        cursor = conn.execute("SELECT status FROM tickets WHERE id = ?;", (tid,))
        assert cursor.fetchone()[0] == "open"


def test_ticket_merge():
    cookies, csrf_token = _login_owner()

    # Step up for merge
    with db.db() as conn:
        cursor = conn.execute("SELECT totp_secret_enc FROM admin_users WHERE email = 'owner@kavach.ai';")
        enc = cursor.fetchone()[0]
    secret = admin_auth.decrypt_totp_secret(enc)
    totp = pyotp.TOTP(secret)
    client.post("/admin-api/auth/step-up", cookies=cookies, headers={"X-CSRF-Token": csrf_token}, json={"totp_code": totp.now()})

    res_a = client.post("/api/support", json={"name": "User", "email": "user@example.com", "category": "bug", "subject": "Issue A", "message": "Message A"})
    res_b = client.post("/api/support", json={"name": "User", "email": "user@example.com", "category": "bug", "subject": "Issue B duplicate", "message": "Message B"})

    with db.db() as conn:
        cursor = conn.execute("SELECT id FROM tickets WHERE subject = 'Issue A';")
        id_a = cursor.fetchone()[0]
        cursor = conn.execute("SELECT id FROM tickets WHERE subject = 'Issue B duplicate';")
        id_b = cursor.fetchone()[0]

    # Merge Ticket B into Ticket A
    res_merge = client.post(
        f"/admin-api/tickets/{id_b}/merge",
        cookies=cookies,
        headers={"X-CSRF-Token": csrf_token},
        json={"target_ticket_id": id_a},
    )
    assert res_merge.status_code == 200
    assert res_merge.json()["merged"] is True

    # Source ticket B is closed, Target ticket A has messages from both
    with db.db() as conn:
        cursor = conn.execute("SELECT status FROM tickets WHERE id = ?;", (id_b,))
        assert cursor.fetchone()[0] == "closed"

        cursor = conn.execute("SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = ?;", (id_a,))
        count = cursor.fetchone()[0]
        assert count >= 3  # Msg A + Msg B + System merge note


def test_email_ticket_received_link_and_reply_roundtrip(monkeypatch):
    """X2 / D-007 verification: email portal_url uses public_site_url and customer reply roundtrips."""
    import re
    from app.config import get_settings

    s = get_settings()
    site_url = s.public_site_url

    # 1. Submit support ticket
    res = client.post(
        "/api/support",
        json={
            "name": "Priya Patel",
            "email": "priya.patel@example.com",
            "category": "device_listening",
            "subject": "Microphone Sensitivity Question",
            "message": "Is 16kHz PCM16 required for both elder tablet and mobile speaker?",
        },
    )
    assert res.status_code == 200
    ticket_num = res.json()["ticket_number"]
    portal_url_res = res.json()["portal_url"]
    assert portal_url_res.startswith(f"{site_url}/support/t/")

    # 2. Inspect ticket_received email in outbox
    with db.db() as conn:
        cursor = conn.execute(
            "SELECT html_body, text_body FROM email_outbox WHERE recipient = 'priya.patel@example.com' ORDER BY id DESC LIMIT 1;"
        )
        row = cursor.fetchone()
        assert row is not None, "Email should be dispatched to outbox"
        html_body, text_body = row

    # Verify link in email points to site_url, NOT raw API or public_url:8000
    match = re.search(r'href="([^"]+/support/t/([^"]+))"', html_body)
    assert match is not None, "Email HTML must contain a link to /support/t/[token]"
    full_email_link = match.group(1)
    extracted_token = match.group(2)

    assert full_email_link.startswith(f"{site_url}/support/t/")
    assert "/api/support/t/" not in full_email_link

    # 3. Customer accesses customer portal via extracted token
    res_portal = client.get(f"/api/support/t/{extracted_token}")
    assert res_portal.status_code == 200
    portal_data = res_portal.json()
    assert portal_data["ticket_number"] == ticket_num
    assert portal_data["subject"] == "Microphone Sensitivity Question"
    assert len(portal_data["messages"]) == 1
    assert "16kHz PCM16" in portal_data["messages"][0]["body"]

    # 4. Customer submits reply
    res_reply = client.post(
        f"/api/support/t/{extracted_token}/reply",
        json={"message": "I tested on an iPad and confirmed 16kHz works."},
    )
    assert res_reply.status_code == 200
    assert res_reply.json()["ok"] is True

    # 5. Verify thread updated on portal
    res_portal_2 = client.get(f"/api/support/t/{extracted_token}")
    assert res_portal_2.status_code == 200
    messages_2 = res_portal_2.json()["messages"]
    assert len(messages_2) == 2
    assert messages_2[1]["sender_type"] == "customer"
    assert "iPad and confirmed" in messages_2[1]["body"]

