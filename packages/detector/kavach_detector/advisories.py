"""Advisory and benign context detection to prevent legitimate bank/security warnings from firing."""
from __future__ import annotations

import re

# Phrases that indicate protective advice rather than scam pressure
ADVISORY_PATTERNS = [
    r"never\s+(?:share|disclose|give|ask|request|demand|transfer)\b",
    r"never\s+tell\s+(?:your\s+|anyone\s+your\s+)?(?:otp|pin|password|cvv|credentials|details)\b",
    r"(?:do\s+not|dont|don\'t)\s+(?:share|disclose|give|transfer|send|pay)\b",
    r"(?:do\s+not|dont|don\'t)\s+tell\s+(?:your\s+|anyone\s+your\s+)?(?:otp|pin|password|cvv|credentials|details)\b",
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
    r"जनहित\s+में\s+जारी",
    # S3-B: Awareness / PSA patterns
    r"digital\s+arrest\s+(?:ek\s+)?(?:scam|fraud|farziwada|fargiwada|afwah)\b",
    r"digital\s+arrest\s+se\s+(?:savdhan|bachein|satark)\b",
    r"(?:there\s+is\s+)?no\s+(?:such\s+)?(?:thing|law)\s+(?:as|called)\s+digital\s+arrest\b",
    r"digital\s+arrest\s+is\s+(?:a\s+)?(?:scam|fraud|fake|myth)\b",
    r"डिजिटल\s+अरेस्ट\s+(?:एक\s+)?(?:स्कैम|फ़र्ज़ी|धोखा|फ़र्ज़ीवाड़ा)",
    r"डिजिटल\s+अरेस्ट\s+से\s+(?:सावधान|बचें)",
    r"rbi\s+kehta\s+hai\b",
    r"आरबीआई\s+कहता\s+है",
    r"cyber\s+(?:dost|suraksha|crime\s+helpline|crime\s+awareness)\b",
    r"(?:public\s+service|public\s+interest)\s+announcement\b",
    r"police\s+(?:warns?|warning|advisory|alerts?|appeal)\b",
    r"police\s+kabhi\s+(?:video\s+call|skype|whatsapp)\s+par\s+(?:arrest|giraftaar)\s+nahi\b",
    r"police\s+never\s+(?:arrests?|calls?)\s+(?:on|over|via)\s+(?:video\s+call|skype|whatsapp)\b",
    r"पुलिस\s+कभी\s+वीडियो\s+कॉल\s+पर\s+(?:अरेस्ट|गिरफ्तार)\s+नहीं",
    r"जागरूकता\s+संदेश\b",
    # S3-B: News reporting patterns (raids, court sentences, fraud busts)
    r"(?:cbi|police|ed|nia)\s+(?:raids|raided|conducts?\s+raids?|arrested|busted|cracks?\s+down)\b",
    r"(?:cbi|police)\s+ne\s+(?:chhaapa|giraftaar|pakda|bhandaphod)\b",
    r"news\s+(?:bulletin|report|headlines?|update|broadcast)\b",
    r"samachar\s+(?:bulletin|patrika)?\b",
    r"khabron\s+ke\s+anusar\b",
    r"police\s+(?:arrests|arrested)\s+(?:cyber|fraudsters|gang|criminals)\b",
    r"(?:सीबीआई|पुलिस)\s+ने\s+(?:छापा|गिरफ्तार|भंडाफोड़)\b",
    r"समाचार\s+बुलेटिन\b",
    r"शेयर\s+न\s+करें",
    r"साझा\s+न\s+करें",
    r"(?:ओटीपी|पिन|पासवर्ड|विवरण|जानकारी)\s+(?:मत|न)\s+बताएं",
    r"कभी\s+नहीं\s+मांगता",
    r"किसी\s+को\s+ओटीपी\s+न\s+दें",
    r"पैसे\s+ट्रांसफर\s+न\s+करें",
]

_COMPILED_ADVISORIES = [re.compile(p, re.IGNORECASE) for p in ADVISORY_PATTERNS]


def is_genuine_advisory(text_norm: str) -> bool:
    """Return True if the segment is an official security advisory, awareness PSA, or news report (S3-B)."""
    return any(p.search(text_norm) for p in _COMPILED_ADVISORIES)
