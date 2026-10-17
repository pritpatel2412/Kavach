"""Adversarial benign tests and scam family detection tests."""
from pathlib import Path

from kavach_detector import RiskScorer, format_reason
from kavach_detector.dictionary import load_dictionary


def test_adversarial_genuine_advisories_do_not_fire():
    """Genuine bank/security advisories MUST NOT fire S5 or S1."""
    sc = RiskScorer()
    advisories = [
        "Dear customer, never share your OTP with anyone.",
        "Remember, we will never ask for your PIN or password.",
        "SBI security notice: bank officers will never request your OTP.",
        "Do not share your OTP or UPI PIN under any circumstances.",
        "Savdhan: kabhi bhi kisi ko apna OTP mat batayein.",
        "Bank kabhi bhi phone par OTP ya PIN nahi mangta.",
        "Fraud awareness: never transfer money to unknown safe accounts.",
        "Caution: do not disclose your six digit code.",
        "किसी को भी अपना ओटीपी शेयर न करें, बैंक कभी पासवर्ड नहीं मांगता।",
    ]
    for adv in advisories:
        up = sc.update(adv)
        assert not any(s in ("S1_authority", "S5_payment") for s, _ in up.hits), f"False alarm on: {adv}"
    assert sc.max_level == 0
    assert sc.max_score == 0


def test_scam_family_courier_fedex():
    sc = RiskScorer()
    sc.update("FedEx courier customs department speaking")
    up = sc.update("Drugs in the parcel found under your Aadhaar card")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen
    assert up.score >= 35


def test_scam_family_kyc_bank():
    sc = RiskScorer()
    sc.update("Calling from bank KYC department")
    up = sc.update("Your account blocked because PAN not linked")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen


def test_scam_family_electricity_disconnection():
    sc = RiskScorer()
    sc.update("Bijli vibhag electricity board se officer bol raha hoon")
    up = sc.update("Electricity bill unpaid hai aur power cut tonight ho jayega")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen


def test_scam_family_sim_trai():
    sc = RiskScorer()
    sc.update("Telecom regulatory authority TRAI office calling")
    up = sc.update("Illegal SIM card used and obscene messages sent from your number")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen


def test_scam_family_fake_investment():
    sc = RiskScorer()
    sc.update("Institutional trading desk registered investment advisor")
    up = sc.update("VIP trading group with guaranteed returns and guaranteed profit")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen


def test_scam_family_sextortion():
    sc = RiskScorer()
    sc.update("Cyber crime cell police here")
    up = sc.update("An obscene video call was recorded and video will be leaked on YouTube")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen


def test_scam_family_relative_in_distress():
    sc = RiskScorer()
    sc.update("Police station inspector speaking")
    sc.update("Your son in police custody after a serious accident")
    up = sc.update("Arrange bail money immediately right now")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen
    assert "S5_payment" in up.stages_seen
    assert up.level >= 2


def test_scam_family_remote_access_apps():
    sc = RiskScorer()
    up = sc.update("Download AnyDesk or install TeamViewer and share your screen right now")
    assert "S3_isolation" in up.stages_seen
    assert "S4_urgency" in up.stages_seen


def test_scam_family_otp_pin_request():
    sc = RiskScorer()
    sc.update("Police officer speaking")
    up = sc.update("Tell me your OTP immediately or UPI PIN enter karo")
    assert "S1_authority" in up.stages_seen
    assert "S5_payment" in up.stages_seen
    # S1 + S5 together within window triggers immediate L3
    assert up.level == 3
    assert up.s1_s5_together is True


def test_explainability_reason_formatting():
    stages = ["S1_authority", "S5_payment"]
    en = format_reason(stages, "en")
    hi = format_reason(stages, "hi")
    assert "authority" in en.lower() and ("safe-account" in en.lower() or "otp" in en.lower())
    assert "अधिकारी" in hi and ("पैसे" in hi or "otp" in hi.lower())

    # Empty stages
    assert "No scam indicators" in format_reason([], "en")


def test_gujarati_dictionary_loading():
    gu_path = Path(__file__).resolve().parents[1] / "kavach_detector" / "dictionaries" / "gu.yaml"
    dict_gu = load_dictionary(gu_path)
    sc = RiskScorer(dictionary=dict_gu)
    up = sc.update("સીબીઆઈ પોલીસ અધિકારી")
    assert "S1_authority" in up.stages_seen
    up2 = sc.update("પાર્સલમાં ડ્રગ્સ મળ્યા છે")
    assert "S2_accusation" in up2.stages_seen


def test_adversarial_advisory_transfer_na_karein():
    """Advisory with 'Kabhi bhi kisi anjaan vyakti ke kehne par safe account mein paise transfer na karein' must NOT fire S5."""
    sc = RiskScorer()
    up = sc.update("Kabhi bhi kisi anjaan vyakti ke kehne par safe account mein paise transfer na karein.")
    assert not any(s == "S5_payment" for s, _ in up.hits)
    assert sc.max_level == 0


def test_scam_family_electricity_update_fees():
    sc = RiskScorer()
    sc.update("Bijli vibhag electricity department officer calling")
    sc.update("Electricity power disconnect tonight at 9 pm due to unpaid invoice")
    up = sc.update("Transfer bill update fees immediately to save connection")
    assert "S1_authority" in up.stages_seen
    assert "S2_accusation" in up.stages_seen
    assert "S5_payment" in up.stages_seen
    assert up.level >= 2


def test_scam_family_remote_access_pin_phish():
    sc = RiskScorer()
    sc.update("Bank server security alert on your device")
    sc.update("Download QuickSupport or AnyDesk app to clean device")
    up = sc.update("Enter your secret PIN aur password to verify identity")
    assert "S1_authority" in up.stages_seen
    assert "S3_isolation" in up.stages_seen
    assert "S5_payment" in up.stages_seen
    assert up.level >= 2

