"""Rule-based scam-stage scorer.

Pure Python, no I/O, no wall-clock dependence (callers may pass ts), so it can be unit-tested
and replayed offline on saved transcripts at zero credit cost.
"""
from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Callable

try:  # optional, improves recall on ASR spelling variants
    from rapidfuzz import fuzz
except Exception:  # pragma: no cover
    fuzz = None

from .dictionary import load_dictionary
from .normalise import normalise

STAGES = ["S1_authority", "S2_accusation", "S3_isolation", "S4_urgency", "S5_payment"]
WEIGHTS = {"S1_authority": 15, "S2_accusation": 20, "S3_isolation": 25, "S4_urgency": 10, "S5_payment": 30}
ORDER_BONUS = 10
WINDOW_S = 600.0          # a stage stays "seen" for 10 minutes after it was last heard
S1_S5_WINDOW_S = 180.0    # authority + payment within 3 minutes => immediate L3
L1, L2, L3 = 40, 70, 90
FUZZY_MIN_LEN = 14        # only fuzzy-match long phrases; short ones must match exactly (see test_benign_rent_transfer)
FUZZY_THRESHOLD = 90


def level_for(score: int, s1_s5_together: bool = False) -> int:
    if s1_s5_together or score >= L3:
        return 3
    if score >= L2:
        return 2
    if score >= L1:
        return 1
    return 0


@dataclass
class RiskUpdate:
    segment_index: int
    hits: list[tuple[str, str]]          # (stage, phrase) matched in THIS segment
    new_stages: list[str]                # stages first seen (or re-seen after expiry) in this segment
    stages_seen: list[str]
    score: int
    level: int
    previous_level: int
    s1_s5_together: bool = False

    @property
    def level_changed(self) -> bool:
        return self.level != self.previous_level


@dataclass
class _Seen:
    first: float
    last: float


class RiskScorer:
    def __init__(self, dictionary: dict[str, list[str]] | None = None,
                 clock: Callable[[], float] = time.monotonic, window_s: float = WINDOW_S):
        self.dictionary = dictionary or load_dictionary()
        self._clock = clock
        self.window_s = window_s
        self._seen: dict[str, _Seen] = {}
        self.level = 0
        self.max_level = 0
        self.max_score = 0
        self._patterns = {s: [(ph, self._compile(ph)) for ph in phrases] for s, phrases in self.dictionary.items()}

    @staticmethod
    def _compile(phrase: str) -> re.Pattern:
        # whitespace-delimited match works for Latin and Devanagari alike
        return re.compile(r"(?<!\S)" + re.escape(phrase) + r"(?!\S)")

    def reset(self) -> None:
        self._seen.clear()
        self.level = self.max_level = self.max_score = 0

    def _match(self, text_norm: str) -> list[tuple[str, str]]:
        hits: list[tuple[str, str]] = []
        for stage, plist in self._patterns.items():
            for phrase, pat in plist:
                if pat.search(text_norm):
                    hits.append((stage, phrase))
                elif (fuzz is not None and len(phrase) >= FUZZY_MIN_LEN and " " in phrase
                      and fuzz.partial_ratio(phrase, text_norm) >= FUZZY_THRESHOLD):
                    hits.append((stage, phrase))
        return hits

    def _expire(self, now: float) -> None:
        for s in [s for s, v in self._seen.items() if now - v.last > self.window_s]:
            del self._seen[s]

    def _order_bonus(self) -> int:
        if len(self._seen) < 3:
            return 0
        ordered = sorted(self._seen.items(), key=lambda kv: (kv[1].first, STAGES.index(kv[0])))
        idx = [STAGES.index(s) for s, _ in ordered]
        return ORDER_BONUS if all(a <= b for a, b in zip(idx, idx[1:])) else 0

    def _s1_s5(self) -> bool:
        a, b = self._seen.get("S1_authority"), self._seen.get("S5_payment")
        if not a or not b:
            return False
        return abs(a.first - b.first) <= S1_S5_WINDOW_S or abs(a.last - b.last) <= S1_S5_WINDOW_S

    def update(self, text: str, segment_index: int = 0, ts: float | None = None) -> RiskUpdate:
        now = self._clock() if ts is None else ts
        self._expire(now)
        hits = self._match(normalise(text))
        new_stages: list[str] = []
        for stage, _ in hits:
            if stage not in self._seen:
                self._seen[stage] = _Seen(first=now, last=now)
                if stage not in new_stages:
                    new_stages.append(stage)
            else:
                self._seen[stage].last = now
        score = min(100, sum(WEIGHTS[s] for s in self._seen) + self._order_bonus())
        together = self._s1_s5()
        prev = self.level
        self.level = level_for(score, together)
        self.max_level = max(self.max_level, self.level)
        self.max_score = max(self.max_score, score)
        return RiskUpdate(segment_index, hits, new_stages, sorted(self._seen, key=STAGES.index),
                          score, self.level, prev, together)
