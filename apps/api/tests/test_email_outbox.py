"""Unit and integration tests for email outbox, localized templates, suppression, and real SMTP via aiosmtpd."""
import asyncio
import smtplib
import threading
from datetime import datetime, timedelta, timezone
from aiosmtpd.controller import Controller
import pytest

from app import db
from app.config import get_settings
from app.email import add_to_suppression_list, enqueue_email, is_suppressed, process_outbox_queue, remove_from_suppression_list
from app.email.sender import send_raw_email, validate_header_value
from app.email.templates import render_template


class MockSmtpHandler:
    def __init__(self):
        self.received_messages = []

    async def handle_DATA(self, server, session, envelope):
        self.received_messages.append({
            "mail_from": envelope.mail_from,
            "rcpt_tos": envelope.rcpt_tos,
            "content": envelope.content.decode("utf-8", errors="replace"),
        })
        return "250 Message accepted for delivery"



@pytest.fixture(autouse=True)
def setup_email_db(tmp_path, monkeypatch):
    test_db = tmp_path / "test_email.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("EMAIL_MODE", "console")
    monkeypatch.setenv("EMAIL_RATE_PER_MIN", "60")
    monkeypatch.setenv("EMAIL_DAILY_CAP", "100")
    db.init_db()
    yield


def test_header_injection_rejection():
    # Newline in recipient
    with pytest.raises(ValueError, match="Header injection detected"):
        enqueue_email(recipient="victim@example.com\r\nBcc: spy@evil.com", template="waitlist_confirm")

    # Newline validation directly
    with pytest.raises(ValueError, match="Header injection detected"):
        validate_header_value("Subject", "Legitimate Subject\nInjected-Header: evil")


def test_localized_templates_rendering():
    # English
    subj_en, html_en, text_en = render_template("waitlist_confirm", locale="en", variables={"name": "Rahul", "confirm_url": "http://test/c"})
    assert "Confirm your" in subj_en
    assert "Rahul" in html_en
    assert "http://test/c" in text_en

    # Hindi
    subj_hi, html_hi, text_hi = render_template("waitlist_confirm", locale="hi", variables={"name": "राहुल", "confirm_url": "http://test/c"})
    assert "वेटलिस्ट स्थान की पुष्टि करें" in subj_hi
    assert "राहुल" in html_hi

    # Gujarati
    subj_gu, html_gu, text_gu = render_template("waitlist_confirm", locale="gu", variables={"name": "પ્રીત", "confirm_url": "http://test/c"})
    assert "પ્રતીક્ષાસૂચિ" in subj_gu
    assert "પ્રીત" in html_gu

    # Fallback to English for unknown locale
    subj_fb, html_fb, _ = render_template("waitlist_confirm", locale="fr", variables={"name": "Jean", "confirm_url": "http://test/c"})
    assert "Confirm your" in subj_fb


def test_suppression_list_lifecycle():
    email = "unsubscribed_user@example.com"
    assert is_suppressed(email) is False

    add_to_suppression_list(email, reason="unsubscribed")
    assert is_suppressed(email) is True

    # Enqueueing email to suppressed user must directly mark as suppressed
    eid = enqueue_email(recipient=email, template="waitlist_welcome", variables={"name": "Test", "rank": 10})
    with db.db() as conn:
        cursor = conn.execute("SELECT status FROM email_outbox WHERE id = ?;", (eid,))
        status = cursor.fetchone()[0]
    assert status == "suppressed"

    # Removal
    assert remove_from_suppression_list(email) is True
    assert is_suppressed(email) is False


def test_marketing_email_unsubscribe_headers():
    recipient = "marketing_target@example.com"
    _, html, text = render_template(
        "broadcast_base",
        locale="en",
        variables={"subject_title": "Monthly Security Digest", "headline": "Stay Safe", "body_html": "<p>Content</p>", "body_text": "Content"},
        is_marketing=True,
        recipient=recipient,
    )
    assert "Unsubscribe with 1-click" in html
    assert "/unsubscribe?token=" in text


def test_real_smtp_delivery_with_aiosmtpd(monkeypatch):
    """Start in-process aiosmtpd server and verify full SMTP client delivery with outbox worker."""
    handler = MockSmtpHandler()
    controller = Controller(handler, hostname="127.0.0.1", port=10825)

    controller.start()

    try:
        monkeypatch.setenv("EMAIL_MODE", "smtp")
        monkeypatch.setenv("SMTP_HOST", "127.0.0.1")
        monkeypatch.setenv("SMTP_PORT", "10825")
        monkeypatch.setenv("SMTP_STARTTLS", "0")

        eid = enqueue_email(
            recipient="elderly_caregiver@example.com",
            template="ticket_received",
            variables={"name": "Sunita", "ticket_number": "KAV-000100", "subject_clean": "False alarm inquiry", "portal_url": "http://localhost:8000/portal", "sla_hours": 8},
            is_marketing=False,
        )

        # Process outbox
        sent_count = process_outbox_queue(max_batch=5)
        assert sent_count == 1

        # Check in DB that status is 'sent'
        with db.db() as conn:
            cursor = conn.execute("SELECT status, message_id FROM email_outbox WHERE id = ?;", (eid,))
            row = cursor.fetchone()
            assert row[0] == "sent"
            assert row[1] is not None

        # Check in aiosmtpd handler that message arrived
        assert len(handler.received_messages) == 1
        msg = handler.received_messages[0]
        assert "elderly_caregiver@example.com" in msg["rcpt_tos"]

        import email as pyemail
        parsed = pyemail.message_from_string(msg["content"])
        assert "KAV-000100" in parsed["Subject"]
        # Decode payload parts
        plain_body = parsed.get_payload(0).get_payload(decode=True).decode("utf-8")
        assert "False alarm inquiry" in plain_body


    finally:
        controller.stop()


def test_smtp_failure_exponential_backoff(monkeypatch):
    """Verify that SMTP failure increments attempt and schedules future retry."""
    monkeypatch.setenv("EMAIL_MODE", "smtp")
    monkeypatch.setenv("SMTP_HOST", "127.0.0.1")
    monkeypatch.setenv("SMTP_PORT", "65530")  # port not listening

    eid = enqueue_email(
        recipient="fail_test@example.com",
        template="waitlist_confirm",
        variables={"name": "Tester", "confirm_url": "http://test"},
    )

    sent = process_outbox_queue(max_batch=1)
    assert sent == 0

    with db.db() as conn:
        cursor = conn.execute("SELECT status, attempts, next_attempt_at, error_message FROM email_outbox WHERE id = ?;", (eid,))
        row = cursor.fetchone()
        assert row[0] == "failed"
        assert row[1] == 1
        assert row[2] is not None
        assert row[3] is not None
