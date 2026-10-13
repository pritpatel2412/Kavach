"""Text normalisation so Devanagari and Latin ASR output can be matched against one dictionary."""
import re
import unicodedata

_PUNCT = re.compile(r"[^\w\s\u0900-\u097F]", re.UNICODE)
_SPACES = re.compile(r"\s+")


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
    return _SPACES.sub(" ", t).strip()
