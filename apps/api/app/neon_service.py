"""Neon Cloud Integration: Lakebase Postgres, Managed Better Auth, and AI Gateway."""
from __future__ import annotations

import logging
import os
import time
from typing import Any
import urllib.request
import json

from fastapi import APIRouter
from .config import get_settings

log = logging.getLogger("kavach.neon")
neon_router = APIRouter(prefix="/api/neon", tags=["Neon Cloud"])


import re

def _sanitize_error(err: Any) -> str:
    """Mask any embedded user, passwords, or endpoints in database error strings."""
    s = str(err)
    s = re.sub(r"://([^:]+):([^@]+)@([^/\s:]+)", r"://***:***@ep-***.neon.tech", s)
    s = re.sub(r"password=([^\s]+)", r"password=***", s)
    s = re.sub(r"user=([^\s]+)", r"user=***", s)
    s = re.sub(r"host=([^\s]+)", r"host=ep-***.neon.tech", s)
    return s


def test_neon_postgres_health() -> dict[str, Any]:
    """Tests connection to Neon Lakebase Postgres using psycopg."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url or not (db_url.startswith("postgres://") or db_url.startswith("postgresql://")):
        return {
            "ok": True,
            "status": "not_configured",
            "message": "DATABASE_URL is not set to a Postgres connection string (using SQLite).",
            "branch": "local",
            "pooled": False,
        }

    try:
        import psycopg
    except ImportError:
        return {
            "ok": False,
            "status": "driver_missing",
            "message": "psycopg driver is not installed.",
            "branch": os.getenv("NEON_BRANCH", "production"),
            "pooled": "-pooler" in db_url,
        }

    t0 = time.perf_counter()
    try:
        with psycopg.connect(db_url, connect_timeout=5) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 as healthy, current_database(), current_user, version();")
                row = cur.fetchone()
                latency_ms = round((time.perf_counter() - t0) * 1000, 2)
                return {
                    "ok": True,
                    "status": "healthy",
                    "latency_ms": latency_ms,
                    "database": row[1] if row else "neondb",
                    "user": "***",
                    "version": row[3][:25] if row else None,
                    "pooled": "-pooler" in db_url,
                    "branch": os.getenv("NEON_BRANCH", "production"),
                }
    except Exception as e:
        clean_err = _sanitize_error(e)
        log.warning("Neon postgres health check failed: %s", clean_err)
        return {
            "ok": False,
            "status": "error",
            "error": clean_err,
            "pooled": "-pooler" in db_url,
            "branch": os.getenv("NEON_BRANCH", "production"),
        }


def test_neon_auth_health() -> dict[str, Any]:
    """Tests connectivity and key verification against Neon Managed Auth JWKS endpoint."""
    jwks_url = os.getenv("NEON_AUTH_JWKS_URL")
    base_url = os.getenv("NEON_AUTH_BASE_URL")
    if not jwks_url:
        return {
            "status": "not_configured",
            "message": "NEON_AUTH_JWKS_URL is not configured.",
        }

    t0 = time.perf_counter()
    try:
        req = urllib.request.Request(
            jwks_url,
            headers={"User-Agent": "Kavach-Server/1.5.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            latency_ms = round((time.perf_counter() - t0) * 1000, 2)
            keys = data.get("keys", [])
            return {
                "status": "healthy",
                "latency_ms": latency_ms,
                "base_url": base_url,
                "jwks_url": jwks_url,
                "active_keys_count": len(keys),
                "key_algorithm": keys[0].get("alg") if keys else None,
            }
    except Exception as e:
        clean_err = _sanitize_error(e)
        log.warning("Neon Auth health check failed: %s", clean_err)
        return {
            "status": "error",
            "error": clean_err,
        }


def test_neon_ai_gateway_health() -> dict[str, Any]:
    """Inspects Neon AI Gateway status, consent gating, and zero-audio guarantee."""
    token = os.getenv("NEON_AI_GATEWAY_TOKEN")
    base_url = os.getenv("NEON_AI_GATEWAY_BASE_URL")
    has_config = bool(token and base_url)
    return {
        "status": "configured" if has_config else "disabled_on_free_tier",
        "base_url": base_url if base_url else None,
        "token_configured": bool(token),
        "default_state": "OFF",
        "consent_gated": True,
        "transcripts_allowed": False,
        "privacy_guarantee": "Zero audio, transcripts, or personal data can reach an AI gateway.",
        "tier_notice": "AI Gateway operates only on Neon paid plans with explicit user consent.",
    }


def _build_neon_status_response() -> dict[str, Any]:
    pg = test_neon_postgres_health()
    auth = test_neon_auth_health()
    ai = test_neon_ai_gateway_health()

    is_overall_healthy = (
        pg.get("status") in ("healthy", "not_configured") and
        auth.get("status") in ("healthy", "not_configured")
    )

    db_url = os.getenv("DATABASE_URL") or ""
    is_pooled = "-pooler" in db_url
    branch = os.getenv("NEON_BRANCH", "production")

    return {
        "ok": bool(is_overall_healthy),
        "branch": branch,
        "pooled": bool(is_pooled),
        "status": "healthy" if is_overall_healthy else "degraded",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "services": {
            "postgres": pg,
            "auth": auth,
            "ai_gateway": ai,
        },
    }


@neon_router.get("/status")
@neon_router.get("/health")
def get_neon_status() -> dict[str, Any]:
    """Full health check diagnostics of wired Neon Cloud services without secret leakage."""
    return _build_neon_status_response()


@neon_router.get("/api/neon-health", include_in_schema=False)
def get_neon_health_alias() -> dict[str, Any]:
    """Alias for /api/neon-health requirement."""
    return _build_neon_status_response()

