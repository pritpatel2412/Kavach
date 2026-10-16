"""Liveness phrase match: Prisma REST transcript vs the challenge sentence (fuzzy)."""
from __future__ import annotations

from rapidfuzz import fuzz

from kavach_detector import normalise


def liveness_ok(transcript: str, expected: str, threshold: float) -> bool:
    a, b = normalise(transcript), normalise(expected)
    if not a or not b:
        return False
    return max(fuzz.ratio(a, b), fuzz.partial_ratio(a, b)) >= threshold
