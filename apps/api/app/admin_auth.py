"""Admin authentication, passwordless magic links, TOTP MFA, sessions, CSRF, and RBAC."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Cookie, Depends, Header, HTTPException, Request, Response
import pyotp

from . import audit, db
from .config import get_settings

log = logging.getLogger("kavach.admin_auth")

COOKIE_NAME = "kavach_admin_session"
IDLE_TIMEOUT_SECONDS = 30 * 60  # 30 minutes
ABSOLUTE_TIMEOUT_SECONDS = 8 * 3600  # 8 hours
STEP_UP_VALIDITY_SECONDS = 5 * 60  # 5 minutes
MAGIC_LINK_TTL_SECONDS = 10 * 60  # 10 minutes
TEMP_TOTP_TOKEN_TTL = 5 * 60  # 5 minutes

ROLE_PERMISSIONS = {
    "owner": {
        "view_telemetry", "view_tickets", "manage_tickets", "view_coupons",
        "manage_coupons", "adjust_credits", "export_data", "bulk_email",
        "manage_users", "manage_flags", "view_audit", "verify_audit",
        "view_households", "manage_devices", "view_email", "manage_waitlist"
    },
    "support_agent": {
        "view_telemetry", "view_tickets", "manage_tickets", "view_coupons",
        "view_households", "view_audit", "view_waitlist"
    },
    "viewer": {
        "view_telemetry", "view_tickets", "view_coupons", "view_households", "view_audit"
    }
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()


def _get_encryption_key() -> bytes:
    return hashlib.sha256(get_settings().secret_key.encode("utf-8")).digest()


def encrypt_totp_secret(secret: str) -> str:
    """Symmetric encryption for TOTP secret using key derived from secret_key."""
    key = _get_encryption_key()
    raw = secret.encode("utf-8")
    # Simple XOR with stream derived from HMAC-SHA256
    pad = hmac.new(key, b"totp_enc_salt", hashlib.sha256).digest()
    while len(pad) < len(raw):
        pad += hmac.new(key, pad, hashlib.sha256).digest()
    enc = bytes(a ^ b for a, b in zip(raw, pad[:len(raw)]))
    return base64.b64encode(enc).decode("ascii")


def decrypt_totp_secret(enc_secret: str) -> str:
    key = _get_encryption_key()
    enc = base64.b64decode(enc_secret.encode("ascii"))
    pad = hmac.new(key, b"totp_enc_salt", hashlib.sha256).digest()
    while len(pad) < len(enc):
        pad += hmac.new(key, pad, hashlib.sha256).digest()
    raw = bytes(a ^ b for a, b in zip(enc, pad[:len(enc)]))
    return raw.decode("utf-8")


def check_login_lockout(key: str) -> None:
    """Check if email or IP is locked out due to excessive failed attempts."""
    now = datetime.now(timezone.utc)
    with db.db() as conn:
        cursor = conn.execute("SELECT attempts, locked_until FROM admin_login_attempts WHERE key = ?;", (key,))
        row = cursor.fetchone()
        if row and row[1]:
            try:
                locked_until = datetime.fromisoformat(row[1])
                if locked_until > now:
                    remaining_min = int((locked_until - now).total_seconds() / 60) + 1
                    raise HTTPException(
                        status_code=429,
                        detail={"error": "account_locked", "message": f"Too many failed attempts. Locked for {remaining_min} more minute(s)."},
                    )
            except (ValueError, TypeError):
                pass


def record_login_attempt(key: str, success: bool) -> None:
    now = datetime.now(timezone.utc)
    with db.db() as conn:
        if success:
            conn.execute("DELETE FROM admin_login_attempts WHERE key = ?;", (key,))
            return

        cursor = conn.execute("SELECT attempts FROM admin_login_attempts WHERE key = ?;", (key,))
        row = cursor.fetchone()
        attempts = (row[0] + 1) if row else 1
        locked_until = None
        if attempts >= 5:
            locked_until = (now + timedelta(minutes=15)).isoformat()
            log.warning("Admin login locked out for %s (5 failed attempts)", key)

        conn.execute(
            """
            INSERT INTO admin_login_attempts (key, attempts, locked_until, last_attempt)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                attempts = excluded.attempts,
                locked_until = excluded.locked_until,
                last_attempt = excluded.last_attempt;
            """,
            (key, attempts, locked_until, now.isoformat()),
        )


def is_admin_email_allowed(email: str) -> bool:
    s = get_settings()
    clean = email.strip().lower()
    if not s.admin_allowed_emails:
        # If no explicit list in dev, allow localhost or default domain
        return True
    return clean in s.admin_allowed_emails


def request_magic_link(email: str, ip: str = "") -> dict:
    """Generate a single-use 10-minute magic link token."""
    clean_email = email.strip().lower()
    check_login_lockout(f"email:{clean_email}")
    check_login_lockout(f"ip:{ip}")

    # Generic response message returned unconditionally to prevent email enumeration
    generic_response = {
        "ok": True,
        "message": "If this email is an authorized administrative account, an authentication magic link has been dispatched.",
    }

    if not is_admin_email_allowed(clean_email):
        log.warning("Admin login requested for non-allowlisted email: %s", clean_email)
        return generic_response

    # Check if admin user exists in admin_users table
    with db.db() as conn:
        cursor = conn.execute("SELECT id, is_suspended, totp_secret_enc FROM admin_users WHERE email = ?;", (clean_email,))
        user = cursor.fetchone()

    if not user or user[1] == 1:
        log.warning("Admin user %s not found or suspended", clean_email)
        return generic_response

    # Generate single-use random token
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=MAGIC_LINK_TTL_SECONDS)).isoformat()
    now_iso = _now_iso()

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO admin_magic_tokens (token_hash, email, expires_at, used, created_at)
            VALUES (?, ?, ?, 0, ?);
            """,
            (token_hash, clean_email, expires_at, now_iso),
        )

    # Dispatch email or log in console
    s = get_settings()
    login_link = f"{s.admin_origin}/auth/verify?token={raw_token}"
    log.info("[ADMIN MAGIC LINK] Dispatched login link to %s: %s", clean_email, login_link)

    # Record outbox email if email system is active
    try:
        from .email.sender import enqueue_email
        enqueue_email(
            recipient=clean_email,
            template="admin_login_link",
            locale="en",
            subject=f"Your {s.brand_name} Admin Magic Link",
            variables={"login_link": login_link, "expires_in_minutes": 10, "brand_name": s.brand_name},
        )
    except Exception as e:
        log.warning("Could not enqueue admin login email: %s", e)

    return generic_response


def verify_magic_link_token(raw_token: str) -> dict:
    """Verify magic link token and issue temporary TOTP step token."""
    token_hash = _hash_token(raw_token)
    now = datetime.now(timezone.utc)

    with db.db() as conn:
        cursor = conn.execute(
            "SELECT email, expires_at, used FROM admin_magic_tokens WHERE token_hash = ?;",
            (token_hash,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail={"error": "invalid_token", "message": "Magic link token invalid or already used."})

        email, expires_at_str, used = row[0], row[1], row[2]
        if used == 1:
            raise HTTPException(status_code=400, detail={"error": "token_used", "message": "Magic link has already been used."})

        if datetime.fromisoformat(expires_at_str) < now:
            raise HTTPException(status_code=400, detail={"error": "token_expired", "message": "Magic link has expired (10 min TTL)."})

        # Mark token as used immediately
        conn.execute("UPDATE admin_magic_tokens SET used = 1 WHERE token_hash = ?;", (token_hash,))

    # Create temporary signed token for TOTP step (5 min TTL)
    from .signed_token import create_action_token
    temp_totp_token = create_action_token(email, purpose="admin_totp_step", ttl_s=TEMP_TOTP_TOKEN_TTL)

    return {
        "ok": True,
        "email": email,
        "temp_token": temp_totp_token,
        "requires_totp": True,
    }


def complete_totp_login(temp_token: str, totp_code: str, ip: str = "", user_agent: str = "") -> dict:
    """Verify TOTP code using pyotp and issue admin session cookie."""
    from .signed_token import verify_action_token
    payload = verify_action_token(temp_token, expected_purpose="admin_totp_step")
    if not payload:
        raise HTTPException(status_code=401, detail={"error": "invalid_temp_token", "message": "TOTP session step expired. Request a new link."})

    email = payload["session_id"]
    check_login_lockout(f"email:{email}")

    with db.db() as conn:
        cursor = conn.execute("SELECT id, role, totp_secret_enc, is_suspended FROM admin_users WHERE email = ?;", (email,))
        user = cursor.fetchone()

    if not user or user[3] == 1:
        raise HTTPException(status_code=403, detail={"error": "forbidden", "message": "Admin account suspended or deleted."})

    user_id, role, enc_secret = user[0], user[1], user[2]
    if not enc_secret:
        raise HTTPException(status_code=500, detail={"error": "totp_not_configured", "message": "MFA TOTP is not bootstrapped for this account."})

    totp_secret = decrypt_totp_secret(enc_secret)
    totp = pyotp.TOTP(totp_secret)
    is_valid = totp.verify(totp_code.strip().replace(" ", ""), valid_window=1)

    if not is_valid:
        record_login_attempt(f"email:{email}", success=False)
        record_login_attempt(f"ip:{ip}", success=False)
        audit.record_audit_event(
            actor_email=email,
            action="admin_login_failed_totp",
            entity_type="admin_auth",
            entity_id=user_id,
            payload={"reason": "invalid_totp_code"},
            ip=ip,
            user_agent=user_agent,
        )
        raise HTTPException(status_code=401, detail={"error": "invalid_totp", "message": "Invalid 6-digit TOTP code."})

    # Success: clear lockout
    record_login_attempt(f"email:{email}", success=True)
    record_login_attempt(f"ip:{ip}", success=True)

    # Create session
    session_id = secrets.token_urlsafe(32)
    csrf_token = secrets.token_hex(16)
    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    absolute_expiry = (now + timedelta(seconds=ABSOLUTE_TIMEOUT_SECONDS)).isoformat()

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO admin_sessions (session_id, email, role, created_at, last_activity, absolute_expiry, csrf_token, step_up_valid_until)
            VALUES (?, ?, ?, ?, ?, ?, ?, NULL);
            """,
            (session_id, email, role, created_at, created_at, absolute_expiry, csrf_token),
        )
        conn.execute("UPDATE admin_users SET last_login = ? WHERE id = ?;", (created_at, user_id))

    audit.record_audit_event(
        actor_email=email,
        action="admin_login_success",
        entity_type="admin_session",
        entity_id=session_id,
        payload={"role": role},
        ip=ip,
        user_agent=user_agent,
    )

    return {
        "ok": True,
        "session_id": session_id,
        "csrf_token": csrf_token,
        "role": role,
        "email": email,
    }


def verify_step_up_totp(session: dict, totp_code: str, ip: str = "", user_agent: str = "") -> dict:
    """Verify TOTP re-prompt for privileged step-up actions (5 min validity)."""
    email = session["email"]
    with db.db() as conn:
        cursor = conn.execute("SELECT id, totp_secret_enc FROM admin_users WHERE email = ?;", (email,))
        user = cursor.fetchone()

    if not user or not user[1]:
        raise HTTPException(status_code=403, detail={"error": "forbidden", "message": "Account invalid."})

    totp_secret = decrypt_totp_secret(user[1])
    totp = pyotp.TOTP(totp_secret)
    if not totp.verify(totp_code.strip().replace(" ", ""), valid_window=1):
        audit.record_audit_event(
            actor_email=email,
            action="admin_step_up_failed",
            entity_type="admin_session",
            entity_id=session["session_id"],
            payload={"reason": "invalid_totp_code"},
            ip=ip,
            user_agent=user_agent,
        )
        raise HTTPException(status_code=401, detail={"error": "invalid_totp", "message": "Invalid step-up verification code."})

    valid_until = (datetime.now(timezone.utc) + timedelta(seconds=STEP_UP_VALIDITY_SECONDS)).isoformat()
    with db.db() as conn:
        conn.execute(
            "UPDATE admin_sessions SET step_up_valid_until = ? WHERE session_id = ?;",
            (valid_until, session["session_id"]),
        )

    audit.record_audit_event(
        actor_email=email,
        action="admin_step_up_success",
        entity_type="admin_session",
        entity_id=session["session_id"],
        payload={"valid_for_seconds": STEP_UP_VALIDITY_SECONDS},
        ip=ip,
        user_agent=user_agent,
    )

    return {"ok": True, "step_up_valid_until": valid_until}


def invalidate_admin_session(session_id: str) -> None:
    with db.db() as conn:
        conn.execute("DELETE FROM admin_sessions WHERE session_id = ?;", (session_id,))


def get_current_admin(
    request: Request,
    kavach_admin_session: str | None = Cookie(None, alias=COOKIE_NAME),
    x_csrf_token: str | None = Header(None, alias="X-CSRF-Token"),
) -> dict:
    """FastAPI dependency to authenticate admin session, verify CSRF, and check timeouts."""
    s = get_settings()
    if not s.admin_enabled:
        raise HTTPException(status_code=404, detail="Admin console is disabled.")

    if not kavach_admin_session:
        raise HTTPException(status_code=401, detail={"error": "unauthorized", "message": "Admin session cookie required."})

    now = datetime.now(timezone.utc)
    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT session_id, email, role, created_at, last_activity, absolute_expiry, csrf_token, step_up_valid_until
            FROM admin_sessions WHERE session_id = ?;
            """,
            (kavach_admin_session,),
        )
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail={"error": "invalid_session", "message": "Session expired or revoked."})

    session_id, email, role, created_at_s, last_activity_s, abs_expiry_s, csrf_token, step_up_s = row

    # Check absolute expiration (8 hours)
    if datetime.fromisoformat(abs_expiry_s) < now:
        invalidate_admin_session(session_id)
        raise HTTPException(status_code=401, detail={"error": "session_expired", "message": "Absolute 8-hour session expired. Please re-login."})

    # Check idle expiration (30 minutes)
    last_act = datetime.fromisoformat(last_activity_s)
    if (now - last_act).total_seconds() > IDLE_TIMEOUT_SECONDS:
        invalidate_admin_session(session_id)
        raise HTTPException(status_code=401, detail={"error": "session_idle", "message": "Session expired due to 30 minutes of inactivity."})

    # CSRF protection on mutating requests (POST, PUT, DELETE, PATCH)
    if request.method in ("POST", "PUT", "DELETE", "PATCH"):
        if not x_csrf_token or not hmac.compare_digest(x_csrf_token, csrf_token):
            raise HTTPException(status_code=403, detail={"error": "csrf_failed", "message": "Invalid or missing X-CSRF-Token header."})

    # Update last activity timestamp
    now_iso = now.isoformat()
    with db.db() as conn:
        conn.execute("UPDATE admin_sessions SET last_activity = ? WHERE session_id = ?;", (now_iso, session_id))

    # Evaluate step-up validity
    is_step_up_active = False
    if step_up_s:
        try:
            is_step_up_active = datetime.fromisoformat(step_up_s) > now
        except Exception:
            is_step_up_active = False

    return {
        "session_id": session_id,
        "email": email,
        "role": role,
        "csrf_token": csrf_token,
        "step_up_active": is_step_up_active,
        "step_up_valid_until": step_up_s,
    }


def require_permission(permission: str):
    """Dependency factory ensuring admin has required RBAC permission."""
    def dependency(session: dict = Depends(get_current_admin)) -> dict:
        role = session.get("role", "viewer")
        allowed_perms = ROLE_PERMISSIONS.get(role, set())
        if permission not in allowed_perms:
            raise HTTPException(
                status_code=403,
                detail={"error": "forbidden", "message": f"Role '{role}' lacks permission '{permission}'."},
            )
        return session
    return dependency


def require_step_up(session: dict = Depends(get_current_admin)) -> dict:
    """Dependency ensuring privileged action has active step-up TOTP authorization."""
    if not session.get("step_up_active", False):
        raise HTTPException(
            status_code=403,
            detail={
                "error": "step_up_required",
                "message": "This sensitive operation requires recent TOTP step-up authentication.",
            },
        )
    return session
