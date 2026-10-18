"""Email outbox worker, SMTP client with STARTTLS, anti-header-injection, and exponential retry backoff."""
from __future__ import annotations

import email.utils
import logging
import smtplib
import uuid
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .. import db
from ..config import get_settings
from ..signed_token import create_action_token
from .suppression import is_suppressed
from .templates import render_template

log = logging.getLogger("kavach.email.sender")


def validate_header_value(name: str, value: str) -> None:
    """Strictly reject CR or LF in email headers to prevent SMTP header injection."""
    if "\r" in value or "\n" in value:
        raise ValueError(f"Header injection detected in header '{name}': invalid control characters.")


def enqueue_email(
    recipient: str,
    template: str,
    locale: str = "en",
    variables: dict | None = None,
    campaign_id: str | None = None,
    ticket_id: str | None = None,
    is_marketing: bool = False,
) -> str:
    """Enqueue an email into email_outbox with header validation and suppression checking."""
    clean_recipient = recipient.strip().lower()
    validate_header_value("To", clean_recipient)

    s = get_settings()
    validate_header_value("From", s.from_email)
    validate_header_value("Reply-To", s.reply_to)

    subject, html_body, text_body = render_template(
        template_name=template,
        locale=locale,
        variables=variables or {},
        is_marketing=is_marketing,
        recipient=clean_recipient,
    )
    validate_header_value("Subject", subject)

    email_id = uuid.uuid4().hex
    now_iso = datetime.now(timezone.utc).isoformat()

    # Check suppression list
    if is_suppressed(clean_recipient):
        status = "suppressed"
        log.warning("Email to %s was automatically suppressed", clean_recipient)
    else:
        status = "queued"

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO email_outbox (
                id, recipient, template, locale, subject, html_body, text_body,
                status, attempts, next_attempt_at, error_message, message_id,
                campaign_id, ticket_id, created_at, sent_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, NULL, ?, ?, ?, NULL);
            """,
            (
                email_id,
                clean_recipient,
                template,
                locale,
                subject,
                html_body,
                text_body,
                status,
                now_iso,
                campaign_id,
                ticket_id,
                now_iso,
            ),
        )

    log.info("Enqueued email %s to %s [template: %s, status: %s]", email_id, clean_recipient, template, status)
    return email_id


def check_sending_caps(conn) -> tuple[bool, str]:
    """Check daily cap and minute rate limit against email_outbox table."""
    s = get_settings()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    one_min_ago = (now - timedelta(seconds=60)).isoformat()

    # Check daily cap
    cursor = conn.execute(
        "SELECT COUNT(*) FROM email_outbox WHERE status = 'sent' AND sent_at >= ?;",
        (today_start,),
    )
    daily_count = cursor.fetchone()[0]
    if daily_count >= s.email_daily_cap:
        return False, f"Daily email cap reached ({daily_count}/{s.email_daily_cap})"

    # Check rate limit per minute
    cursor = conn.execute(
        "SELECT COUNT(*) FROM email_outbox WHERE status = 'sent' AND sent_at >= ?;",
        (one_min_ago,),
    )
    min_count = cursor.fetchone()[0]
    if min_count >= s.email_rate_per_min:
        return False, f"Email rate limit reached ({min_count}/{s.email_rate_per_min} per min)"

    return True, ""


def send_raw_email(
    recipient: str,
    subject: str,
    html_body: str,
    text_body: str,
    is_marketing: bool = False,
    custom_smtp_client=None,
) -> str:
    """Send multipart email via console logger or real SMTP server."""
    s = get_settings()
    msg_id = email.utils.make_msgid(domain=s.brand_domain)

    if s.email_mode == "console" and custom_smtp_client is None:
        log.info(
            "\n" + "=" * 50 +
            f"\n[CONSOLE EMAIL OUTBOX]\nTo: {recipient}\nSubject: {subject}\nMessage-ID: {msg_id}\n" +
            "-" * 50 + f"\n{text_body}\n" + "=" * 50
        )
        return msg_id

    # Construct standard MIME message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{s.from_name} <{s.from_email}>"
    msg["To"] = recipient
    msg["Reply-To"] = s.reply_to
    msg["Message-ID"] = msg_id
    msg["Date"] = email.utils.formatdate(localtime=True)

    if is_marketing:
        unsub_token = create_action_token(recipient, purpose="email_unsubscribe", ttl_s=86400 * 365)
        unsub_url = f"{s.public_url}/unsubscribe?token={unsub_token}"
        msg["List-Unsubscribe"] = f"<{unsub_url}>"
        msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    if custom_smtp_client:
        custom_smtp_client.send_message(msg)
        return msg_id

    # Connect to configured SMTP server
    smtp = smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=10)
    try:
        smtp.ehlo()
        if s.smtp_starttls:
            smtp.starttls()
            smtp.ehlo()
        if s.smtp_user and s.smtp_pass:
            smtp.login(s.smtp_user, s.smtp_pass)
        smtp.send_message(msg)
    finally:
        try:
            smtp.quit()
        except Exception:
            pass

    return msg_id


def process_outbox_queue(max_batch: int = 10, custom_smtp_client=None) -> int:
    """Worker loop processing queued and failed emails with exponential retry backoff."""
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    processed_count = 0

    with db.db() as conn:
        can_send, reason = check_sending_caps(conn)
        if not can_send:
            log.warning("Email dispatch paused: %s", reason)
            return 0

        cursor = conn.execute(
            """
            SELECT id, recipient, template, subject, html_body, text_body, attempts, campaign_id
            FROM email_outbox
            WHERE status IN ('queued', 'failed')
              AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
              AND attempts < 5
            ORDER BY created_at ASC
            LIMIT ?;
            """,
            (now_iso, max_batch),
        )
        rows = cursor.fetchall()

    for row in rows:
        email_id = row[0]
        recipient = row[1]
        subject = row[3]
        html_body = row[4]
        text_body = row[5]
        attempts = row[6]
        is_marketing = bool(row[7])

        try:
            msg_id = send_raw_email(
                recipient=recipient,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
                is_marketing=is_marketing,
                custom_smtp_client=custom_smtp_client,
            )
            sent_at = datetime.now(timezone.utc).isoformat()
            with db.db() as conn:
                conn.execute(
                    "UPDATE email_outbox SET status = 'sent', message_id = ?, sent_at = ?, attempts = attempts + 1 WHERE id = ?;",
                    (msg_id, sent_at, email_id),
                )
            processed_count += 1
            log.info("Sent email %s successfully (msg_id: %s)", email_id, msg_id)
        except Exception as exc:
            err_msg = str(exc)
            next_attempts = attempts + 1
            # Exponential backoff: 2, 4, 8, 16 minutes
            backoff_seconds = (2 ** next_attempts) * 60
            next_retry = (datetime.now(timezone.utc) + timedelta(seconds=backoff_seconds)).isoformat()
            status = "failed"
            log.error("Failed sending email %s to %s (attempt %d): %s", email_id, recipient, next_attempts, err_msg)
            with db.db() as conn:
                conn.execute(
                    """
                    UPDATE email_outbox
                    SET status = ?, attempts = ?, next_attempt_at = ?, error_message = ?
                    WHERE id = ?;
                    """,
                    (status, next_attempts, next_retry, err_msg, email_id),
                )

    return processed_count
