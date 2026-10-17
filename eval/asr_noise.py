"""Synthetic ASR noise injector for Kavach offline evaluation.

Simulates realistic speech-to-text degradation observed in Indian English, Hindi,
and Hinglish call transcripts:
- Word deletions (dropped words)
- Word duplications / insertions (hesitations / stutter)
- Phonetic / spelling confusions (e.g. CBI -> सीबीआई / see bee eye, warrant -> warren, account -> acount)
- Number mangling (e.g. 1930 -> 19 30, 50000 -> पचास हजार / 50 000)
- Hinglish suffix / variant drift (paisa -> paise, transfer -> transfar)
"""
from __future__ import annotations

import random
import re

# Realistic ASR confusion pairs in Indian acoustic environments
CONFUSIONS = {
    "cbi": ["सीबीआई", "see bee eye", "c b i", "cby"],
    "police": ["पुलिलीस", "polis", "policee", "pulice"],
    "warrant": ["वारंट", "warren", "warant", "varrant"],
    "arrest": ["अरेस्ट", "arest", "a rest", "rest"],
    "transfer": ["ट्रांसफर", "transfar", "transefer", "bhejo"],
    "account": ["अकाउंट", "acount", "accunt", "खाता"],
    "aadhaar": ["आधार", "adhar", "aadhar card", "adhaar"],
    "otp": ["ओटीपी", "o t p", "one time password", "odp"],
    "pin": ["पिन", "p i n", "pen", "piin"],
    "cyber": ["साइबर", "saiber", "cybar", "sayber"],
    "parcel": ["पार्सल", "pasal", "personal", "parsal"],
    "fedex": ["फेडेक्स", "fed ex", "faidex", "fedecks"],
    "customs": ["कस्टम्स", "custom", "kastam", "custam"],
    "kyc": ["केवाईसी", "k y c", "kay why see", "ky c"],
    "electricity": ["बिजली", "bijli", "electrisity", "elec"],
    "trai": ["ट्राई", "t r a i", "tray", "trai office"],
    "anydesk": ["एनीडेस्क", "any desk", "anidesk", "any dis"],
    "teamviewer": ["टीमव्यूअर", "team viewer", "temviewer", "team vewer"],
    "video": ["वीडियो", "vedio", "vdo", "vidio"],
    "confidential": ["कन्फिडेंशियल", "confidenshal", "gopniya"],
    "urgent": ["अर्जेंट", "arjent", "jaldi"],
    "court": ["कोर्ट", "kort", "corte", "adalat"],
}


def mangle_number(token: str, rng: random.Random) -> str:
    """Mangle numeric tokens into split digits or spaced text."""
    if token.isdigit():
        if len(token) > 2 and rng.random() < 0.6:
            mid = len(token) // 2
            return f"{token[:mid]} {token[mid:]}"
    return token


def inject_asr_noise(text: str, target_wer: float, seed: int = 42) -> str:
    """Inject ASR noise into a text string at target Word Error Rate (WER).
    
    target_wer in [0.0, 0.10, 0.20, 0.30].
    seed ensures deterministic, reproducible evaluation.
    """
    if target_wer <= 0.0:
        return text

    rng = random.Random(seed)
    words = text.split()
    if not words:
        return text

    noisy_words = []
    for word in words:
        r = rng.random()
        # Clean clean token for confusion matching
        clean_w = re.sub(r"[^\w]", "", word.lower())

        if r < (target_wer * 0.35):
            # 1. Word deletion (omission)
            continue
        elif r < (target_wer * 0.50):
            # 2. Word duplication (stutter / echo)
            noisy_words.append(word)
            noisy_words.append(word)
        elif r < target_wer:
            # 3. Substitution (confusion or phonetic drift)
            if clean_w in CONFUSIONS and rng.random() < 0.75:
                sub = rng.choice(CONFUSIONS[clean_w])
                noisy_words.append(sub)
            elif word.isdigit():
                noisy_words.append(mangle_number(word, rng))
            else:
                # Minor character glitch (e.g. vowel drop or swap)
                if len(word) > 4 and rng.random() < 0.5:
                    idx = rng.randint(1, len(word) - 2)
                    noisy_words.append(word[:idx] + word[idx + 1:])
                else:
                    noisy_words.append(word)
        else:
            # Kept intact
            noisy_words.append(word)

    return " ".join(noisy_words) if noisy_words else text
