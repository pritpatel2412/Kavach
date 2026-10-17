"""Guardian token authentication dependency."""
from __future__ import annotations

from fastapi import Header, HTTPException

from . import db


def require_guardian(authorization: str | None = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": "Authorization: Bearer <token> required"},
        )
    token = authorization.split("Bearer ", 1)[1].strip()
    guardian = db.get_guardian_by_token(token)
    if not guardian:
        raise HTTPException(
            status_code=401,
            detail={"error": "invalid_token", "message": "Guardian token invalid or revoked"},
        )
    return guardian
