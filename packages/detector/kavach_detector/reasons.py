"""Stage-to-plain-language reason templating in Hindi and English."""
from __future__ import annotations

STAGE_NAMES_EN = {
    "S1_authority": "authority impersonation (police/CBI/TRAI/customs)",
    "S2_accusation": "allegations of crime or illegal parcel",
    "S3_isolation": "demand for secrecy and digital arrest",
    "S4_urgency": "high-pressure immediate arrest threats",
    "S5_payment": "demand for money transfer to a safe account or OTP/PIN",
}

STAGE_NAMES_HI = {
    "S1_authority": "अधिकारी (पुलिस/CBI/कस्टम) बनना",
    "S2_accusation": "अवैध पार्सल या अपराध का झूठा आरोप",
    "S3_isolation": "डिजिटल अरेस्ट और किसी को न बताने का दबाव",
    "S4_urgency": "तुरंत गिरफ़्तारी की धमकी",
    "S5_payment": "सुरक्षित खाते में पैसे या OTP की मांग",
}


def format_reason(stages: list[str], lang: str = "en") -> str:
    if not stages:
        return "No scam indicators detected" if lang == "en" else "कोई संदिग्ध संकेत नहीं मिला"
    s_set = set(stages)
    if lang == "hi":
        if "S1_authority" in s_set and "S5_payment" in s_set:
            return "कॉल करने वाले ने अधिकारी बनकर सुरक्षित खाते में पैसे या OTP की मांग की।"
        if "S1_authority" in s_set and "S2_accusation" in s_set:
            return "कॉल करने वाले ने पुलिस/कस्टम अधिकारी बनकर अपराध का आरोप लगाया।"
        if "S3_isolation" in s_set:
            return "कॉल करने वाले ने किसी को न बताने और कॉल न काटने का दबाव डाला।"
        parts = [STAGE_NAMES_HI[s] for s in stages if s in STAGE_NAMES_HI]
        return "पहचाने गए चरण: " + " · ".join(parts)
    else:
        if "S1_authority" in s_set and "S5_payment" in s_set:
            return "Caller claimed authority impersonation and asked for a safe-account transfer or OTP."
        if "S1_authority" in s_set and "S2_accusation" in s_set:
            return "Caller impersonated police/customs and alleged criminal charges."
        if "S3_isolation" in s_set:
            return "Caller demanded secrecy and forbade disconnecting the call."
        parts = [STAGE_NAMES_EN[s] for s in stages if s in STAGE_NAMES_EN]
        return "Identified stages: " + " · ".join(parts)
