"""In-memory sliding window rate limiter with trusted proxy hop IP parsing."""
from __future__ import annotations

import os
import time
from collections import defaultdict

from fastapi import HTTPException, Request

_limits: dict[str, list[float]] = defaultdict(list)


def get_client_ip(request: Request) -> str:
    """Parse real client IP from X-Forwarded-For using TRUSTED_PROXY_HOPS.

    Prevents client spoofing:
    When behind N reverse proxies (e.g. Vercel -> Render), the trusted client IP
    is at index -(hops) of the comma-separated X-Forwarded-For list.
    """
    hops_str = os.getenv("TRUSTED_PROXY_HOPS", "1")
    try:
        hops = max(1, int(hops_str))
    except ValueError:
        hops = 1

    xff = request.headers.get("x-forwarded-for")
    if xff:
        ips = [ip.strip() for ip in xff.split(",") if ip.strip()]
        if len(ips) >= hops:
            return ips[-hops]
        return ips[0]
    return request.client.host if request.client else "unknown"


def check_rate_limit(key: str, max_requests: int = 15, window_s: float = 60.0) -> None:
    now = time.monotonic()
    times = _limits[key]
    cutoff = now - window_s
    _limits[key] = [t for t in times if t > cutoff]
    if len(_limits[key]) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limited", "message": "Too many requests. Please wait a minute."},
        )
    _limits[key].append(now)


def rate_limit_ip(request: Request, max_requests: int = 20, window_s: float = 60.0) -> None:
    ip = get_client_ip(request)
    check_rate_limit(f"ip:{ip}:{request.url.path}", max_requests=max_requests, window_s=window_s)


def reset_rate_limits() -> None:
    _limits.clear()

