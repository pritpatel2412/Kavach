"""Admin CLI management commands and extensible AuthProvider interface."""
from __future__ import annotations

import argparse
import sys
import uuid
from datetime import datetime, timezone
import pyotp

from . import admin_auth, audit, db
from .config import get_settings


class AuthProvider:
    """Abstract interface for administrative authentication providers."""
    def name(self) -> str:
        raise NotImplementedError

    def authenticate(self, credentials: dict) -> dict | None:
        raise NotImplementedError


class MagicLinkTotpAuthProvider(AuthProvider):
    """Primary zero-password authentication provider using email magic links + mandatory TOTP."""
    def name(self) -> str:
        return "magic_link_totp"

    def authenticate(self, credentials: dict) -> dict | None:
        temp_token = credentials.get("temp_token")
        code = credentials.get("code")
        if not temp_token or not code:
            return None
        return admin_auth.complete_totp_login(temp_token, code)


class GoogleOidcAuthProviderStub(AuthProvider):
    """Extensible stub for enterprise Google Workspace OIDC SSO."""
    def name(self) -> str:
        return "google_oidc"

    def authenticate(self, credentials: dict) -> dict | None:
        # Stub: verified Google ID token payload would be checked against ADMIN_ALLOWED_EMAILS
        raise NotImplementedError("Google OIDC is scaffolded for future enterprise deployments.")


class WebAuthnPasskeyAuthProviderStub(AuthProvider):
    """Extensible stub for FIDO2 / WebAuthn hardware passkeys."""
    def name(self) -> str:
        return "webauthn_passkey"

    def authenticate(self, credentials: dict) -> dict | None:
        # Stub: FIDO2 attestation & assertion verification
        raise NotImplementedError("WebAuthn Passkeys are scaffolded for future enterprise deployments.")


def bootstrap_totp(email: str) -> None:
    """Bootstrap or reset an administrative user's TOTP MFA secret."""
    clean_email = email.strip().lower()
    s = get_settings()

    if s.admin_allowed_emails and clean_email not in s.admin_allowed_emails:
        print(f"[WARNING] Email '{clean_email}' is not currently in ADMIN_ALLOWED_EMAILS env variable.")

    db.init_db()
    # Generate a fresh Base32 TOTP secret
    secret = pyotp.random_base32()
    enc_secret = admin_auth.encrypt_totp_secret(secret)
    now_iso = datetime.now(timezone.utc).isoformat()
    user_id = uuid.uuid4().hex

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO admin_users (id, email, role, totp_secret_enc, created_at, is_suspended)
            VALUES (?, ?, 'owner', ?, ?, 0)
            ON CONFLICT(email) DO UPDATE SET
                totp_secret_enc = excluded.totp_secret_enc,
                is_suspended = 0;
            """,
            (user_id, clean_email, enc_secret, now_iso),
        )

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=clean_email, issuer_name=s.brand_name)

    audit.record_audit_event(
        actor_email="system",
        action="admin_bootstrap_totp",
        entity_type="admin_user",
        entity_id=clean_email,
        payload={"email": clean_email, "role": "owner"},
    )

    print("\n" + "=" * 65)
    print(f" {s.brand_name.upper()} ADMIN TOTP MFA BOOTSTRAP")
    print("=" * 65)
    print(f" Account:         {clean_email}")
    print(f" Assigned Role:   owner")
    print(f" Encryption:      Secret stored encrypted at rest (SHA-256 HMAC stream)")
    print("-" * 65)
    print(f" Base32 Secret:   {secret}")
    print(f" Provisioning URI:{uri}")
    print("-" * 65)
    print(" IMPORTANT: Add this secret to your Authenticator App (Google Authenticator,")
    print(" 1Password, or YubiKey). This raw secret will NEVER be displayed again.")
    print("=" * 65 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Kavach Admin Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    totp_parser = subparsers.add_parser("bootstrap-totp", help="Enroll or reset TOTP secret for an administrator")
    totp_parser.add_argument("email", help="Administrator email address")

    args = parser.parse_args()
    if args.command == "bootstrap-totp":
        bootstrap_totp(args.email)


if __name__ == "__main__":
    main()
