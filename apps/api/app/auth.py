"""Guardian token authentication dependency."""
from __future__ import annotations

from fastapi import Cookie, Header, HTTPException

from . import db


def require_guardian(
    authorization: str | None = Header(None),
    kavach_guardian_session: str | None = Cookie(None),
) -> dict:
    raw_token = None
    if authorization and isinstance(authorization, str) and authorization.startswith("Bearer "):
        raw_token = authorization.split("Bearer ", 1)[1].strip()
    elif kavach_guardian_session and isinstance(kavach_guardian_session, str) and kavach_guardian_session.strip():
        raw_token = kavach_guardian_session.strip()

    if not raw_token:
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": "Authorization: Bearer <token> or guardian session required"},
        )
    guardian = db.get_guardian_by_token(raw_token)
    if not guardian:
        raise HTTPException(
            status_code=401,
            detail={"error": "invalid_token", "message": "Guardian token invalid or revoked"},
        )
    return guardian
