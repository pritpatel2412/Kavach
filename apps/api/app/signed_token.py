"""Signed expiring action tokens for guardian alerts and intercom access (HMAC-SHA256)."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

# Internal secret; can be overridden via KAVACH_SECRET env var
SECRET_KEY = b"kavach_guardian_action_hmac_secret_2026"


def create_action_token(session_id: str, ttl_s: int = 900) -> str:
    """Create a URL-safe signed token with expiration timestamp."""
    payload = {
        "session_id": session_id,
        "exp": int(time.time() + ttl_s),
    }
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    b64_payload = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
    sig = hmac.new(SECRET_KEY, b64_payload.encode("ascii"), hashlib.sha256).digest()
    b64_sig = base64.urlsafe_b64encode(sig).decode("ascii").rstrip("=")
    return f"{b64_payload}.{b64_sig}"


def verify_action_token(token: str, now: float | None = None) -> dict | None:
    """Verify HMAC signature and check that token has not expired."""
    if not token or "." not in token:
        return None
    b64_payload, b64_sig = token.rsplit(".", 1)
    expected_sig = hmac.new(SECRET_KEY, b64_payload.encode("ascii"), hashlib.sha256).digest()
    expected_b64_sig = base64.urlsafe_b64encode(expected_sig).decode("ascii").rstrip("=")
    if not hmac.compare_digest(b64_sig, expected_b64_sig):
        return None
    # Decode payload
    padding = "=" * ((4 - len(b64_payload) % 4) % 4)
    try:
        raw = base64.urlsafe_b64decode((b64_payload + padding).encode("ascii"))
        data = json.loads(raw.decode("utf-8"))
    except Exception:
        return None
    current_time = now if now is not None else time.time()
    if data.get("exp", 0) < current_time:
        return None  # expired
    return data
