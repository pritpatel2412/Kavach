"""Advisory and benign context detection to prevent legitimate bank/security warnings from firing."""
from __future__ import annotations

import re

# Phrases that indicate protective advice rather than scam pressure
ADVISORY_PATTERNS = [
    r"never\s+(?:share|disclose|give|tell|ask|request|demand|transfer)\b",
    r"(?:do\s+not|dont|don\'t)\s+(?:share|disclose|give|tell|transfer|send|pay)\b",
    r"will\s+never\s+(?:ask|request|demand)\b",
    r"never\s+request\b",
    r"never\s+transfer\b",
    r"bank\s+(?:never|kabhi\s+nahi|kabhi\s+bhi)\b",
    r"bank\s+officials?\s+will\s+never\b",
    r"legitimate\s+organizations?\s+will\s+never\b",
    r"kabhi\s+(?:bhi\s+)?(?:share|batao|mat|na)\b",
    r"kabhi\s+(?:bhi\s+)?.*?(?:mat|na)\s+(?:karein|kare|dein|de|batao|bataiye|share|transfer)\b",
    r"kisi\s+ko\s+(?:bhi\s+)?(?:otp|pin|password|paise)\s+(?:mat|na)\b",
    r"kisi\s+ke\s+saath\s+(?:bhi\s+)?(?:share|sajha)\s+(?:mat|na)\b",
    r"kisi\s+(?:bhi\s+)?anjaan\s+vyakti\b",
    r"(?:paise|money|funds?)\s+(?:transfer|bhejne|dena)\s+(?:na\s+karein|mat\s+karein|na\s+kare|mat\s+kare|never)\b",
    r"transfer\s+na\s+karein\b",
    r"savdhan\b",
    r"satark\s+rahein\b",
    r"beware\s+of\b",
    r"caution\s*:\s*never\b",
    r"security\s+(?:tip|awareness|advisory)\b",
    r"safety\s+advisory\b",
    r"genuine\s+bank\s+advisory\b",
    r"fraud\s+(?:awareness|se\s+bachein)\b",
    r"fake\s+calls?\b",
    r"suraksha\s+advisory\b",
    r"jan-hit\s+mein\b",
    r"शेयर\s+न\s+करें",
    r"साझा\s+न\s+करें",
    r"मत\s+बताएं",
    r"कभी\s+नहीं\s+मांगता",
    r"किसी\s+को\s+ओटीपी\s+न\s+दें",
    r"पैसे\s+ट्रांसफर\s+न\s+करें",
]

_COMPILED_ADVISORIES = [re.compile(p, re.IGNORECASE) for p in ADVISORY_PATTERNS]


def is_genuine_advisory(text_norm: str) -> bool:
    """Return True if the segment is an official security advisory (e.g. 'Never share your OTP')."""
    return any(p.search(text_norm) for p in _COMPILED_ADVISORIES)
