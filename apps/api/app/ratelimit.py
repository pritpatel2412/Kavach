"""In-memory sliding window rate limiter."""
from __future__ import annotations

import time
from collections import defaultdict

from fastapi import HTTPException, Request

_limits: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(key: str, max_requests: int = 15, window_s: float = 60.0) -> None:
    now = time.monotonic()
    times = _limits[key]
    # Prune old timestamps
    cutoff = now - window_s
    _limits[key] = [t for t in times if t > cutoff]
    if len(_limits[key]) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limited", "message": "Too many requests. Please wait a minute."},
        )
    _limits[key].append(now)


def rate_limit_ip(request: Request, max_requests: int = 20, window_s: float = 60.0) -> None:
    ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"ip:{ip}:{request.url.path}", max_requests=max_requests, window_s=window_s)


def reset_rate_limits() -> None:
    _limits.clear()

