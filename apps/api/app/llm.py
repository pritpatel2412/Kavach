"""Optional LLM second opinion (Phase 6). Off unless LLM_PROVIDER is set.

Band: rule score 30–85. Strict JSON. 1.5 s timeout. Rules win on any failure.
Adjustment is clamped to +/-25; never used in tests against a live provider.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Awaitable, Callable

import httpx

log = logging.getLogger("kavach.llm")

TIMEOUT_S = 1.5
PROMPT = (
    "You classify a possible phone scam. Genuine banks/couriers/doctors do not demand "
    "safe-account transfers, forbid secrecy, or threaten arrest by phone. "
    "Reply with ONLY JSON: "
    '{"scam_probability":0-1,"stages":["S1_authority"],"reason":"<20 words"}'
)


async def _groq(messages: list[dict], api_key: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT_S) as c:
        r = await c.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": "llama-3.1-8b-instant", "temperature": 0, "messages": messages},
        )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


ClientFn = Callable[[list[dict], str], Awaitable[str]]


async def second_opinion(
    segments: list[str],
    hits: list[str],
    score: int,
    *,
    client: ClientFn | None = None,
    provider: str | None = None,
    api_key: str | None = None,
) -> dict[str, Any] | None:
    """Return parsed JSON or None (caller then keeps the rule score)."""
    prov = (provider if provider is not None else os.getenv("LLM_PROVIDER", "")).strip().lower()
    if not prov or prov in ("none", "off", "0"):
        return None
    if not (30 <= score <= 85):
        return None
    key = api_key if api_key is not None else os.getenv("LLM_API_KEY", "")
    fn = client or (_groq if prov == "groq" else _groq)
    user = json.dumps({"score": score, "hits": hits, "segments": segments[-8:]}, ensure_ascii=False)
    try:
        raw = await fn([{"role": "system", "content": PROMPT}, {"role": "user", "content": user}], key)
        start, end = raw.find("{"), raw.rfind("}")
        data = json.loads(raw[start:end + 1])
        p = float(data["scam_probability"])
        if not 0 <= p <= 1:
            return None
        data["stages"] = list(data.get("stages") or [])
        data["reason"] = str(data.get("reason") or "")[:80]
        return data
    except Exception as e:
        log.info("llm skipped (%s); rules win", type(e).__name__)
        return None


def blend_score(rule_score: int, opinion: dict[str, Any] | None) -> int:
    if not opinion:
        return rule_score
    delta = int(round((float(opinion["scam_probability"]) - 0.5) * 50))
    delta = max(-25, min(25, delta))
    return max(0, min(100, rule_score + delta))
