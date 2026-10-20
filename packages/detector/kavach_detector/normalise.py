"""Text normalisation so Devanagari and Latin ASR output can be matched against one dictionary."""
from __future__ import annotations

import re
import unicodedata

_PUNCT = re.compile(r"[^\w\s\u0900-\u097F]", re.UNICODE)
_SPACES = re.compile(r"\s+")

# ASR acronyms & common phonetic spelling variants
_ASR_VARIANTS = [
    (re.compile(r"(?<!\S)c\s+b\s+i(?!\S)", re.IGNORECASE), "cbi"),
    (re.compile(r"(?<!\S)r\s+b\s+i(?!\S)", re.IGNORECASE), "rbi"),
    (re.compile(r"(?<!\S)t\s+r\s+a\s+i(?!\S)", re.IGNORECASE), "trai"),
    (re.compile(r"(?<!\S)s\s+b\s+i(?!\S)", re.IGNORECASE), "sbi"),
    (re.compile(r"(?<!\S)o\s+t\s+p(?!\S)", re.IGNORECASE), "otp"),
    (re.compile(r"(?<!\S)p\s+i\s+n(?!\S)", re.IGNORECASE), "pin"),
    (re.compile(r"(?<!\S)any\s+desk(?!\S)", re.IGNORECASE), "anydesk"),
    (re.compile(r"(?<!\S)quick\s+support(?!\S)", re.IGNORECASE), "quicksupport"),
    (re.compile(r"(?<!\S)team\s+viewer(?!\S)", re.IGNORECASE), "teamviewer"),
    (re.compile(r"(?<!\S)whats\s+app(?!\S)", re.IGNORECASE), "whatsapp"),
    (re.compile(r"(?<!\S)laundring(?!\S)", re.IGNORECASE), "laundering"),
    (re.compile(r"(?<!\S)(?:aadhar|adhar)(?!\S)", re.IGNORECASE), "aadhaar"),
]

# Verb inflection canonicalization (imperative/subjunctive/infinitive -> root form)
_VERB_INFLECTIONS = [
    (re.compile(r"(?<!\S)(?:बताएं|बताइए|बताना|बताओगे|बताएंगे)(?!\S)"), "बताओ"),
    (re.compile(r"(?<!\S)(?:batayein|bataiye|batana|bataoge|bataenge)(?!\S)", re.IGNORECASE), "batao"),
    (re.compile(r"(?<!\S)(?:कीजिए|करें|करना|करेंगे|करोगे)(?!\S)"), "करो"),
    (re.compile(r"(?<!\S)(?:kijiye|karein|karna|karenge|karoge)(?!\S)", re.IGNORECASE), "karo"),
    (re.compile(r"(?<!\S)(?:भेजें|भेजिए|भेजना|भेजेंगे|भेजोगे)(?!\S)"), "भेजो"),
    (re.compile(r"(?<!\S)(?:bhejein|bhejiye|bhejna|bhejenge|bhejoge)(?!\S)", re.IGNORECASE), "bhejo"),
    (re.compile(r"(?<!\S)(?:काटिए|काटें|काटना|काटेंगे|कटेगी|कटेगा)(?!\S)"), "काटो"),
    (re.compile(r"(?<!\S)(?:kaatiye|kaatein|kaatna|kaatenge|kategi|katega)(?!\S)", re.IGNORECASE), "kaato"),
    (re.compile(r"(?<!\S)(?:रखें|रखिए|रखना|रखेंगे|रखोगे)(?!\S)"), "रखो"),
    (re.compile(r"(?<!\S)(?:rakhein|rakhiye|rakhna|rakhenge|rakhoge)(?!\S)", re.IGNORECASE), "rakho"),
]


def normalise(text: str) -> str:
    """Lowercase, NFC, drop nukta/apostrophes/punctuation, collapse spaces.

    Used on BOTH transcripts and dictionary phrases, so variants collapse the same way.
    """
    if not text:
        return ""
    t = unicodedata.normalize("NFC", text).lower()
    t = t.replace("\u093c", "")          # nukta: ज़ -> ज, so ASR variants match
    t = t.replace("\u0901", "\u0902")    # chandrabindu -> anusvara
    t = t.replace("\u0964", " ").replace("\u0965", " ")  # danda
    t = t.replace("\u2019", "").replace("'", "")        # don't -> dont
    t = _PUNCT.sub(" ", t)
    t = _SPACES.sub(" ", t).strip()

    # Normalize ASR acronyms & variants
    for pat, rep in _ASR_VARIANTS:
        t = pat.sub(rep, t)

    # Normalize Hindi/Hinglish verb inflections
    for pat, rep in _VERB_INFLECTIONS:
        t = pat.sub(rep, t)

    return _SPACES.sub(" ", t).strip()
