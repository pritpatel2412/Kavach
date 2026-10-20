from kavach_detector import RiskScorer, normalise, level_for


def run(segments, step=10.0):
    sc = RiskScorer()
    ups = [sc.update(t, i, ts=i * step) for i, t in enumerate(segments)]
    return sc, ups


def test_normalise_variants():
    assert normalise("Don't  tell ANYONE!") == "dont tell anyone"
    assert normalise("ज़रूरी।") == normalise("जरूरी")


def test_scam_reaches_l2_before_payment():
    segs = [
        "Hello, I am calling from the CBI office in Delhi",
        "There is a case registered against your aadhaar for money laundering",
        "You must stay on video and do not tell anyone about this, this is confidential",
        "Transfer the money to the safe account right now for verification",
    ]
    sc, ups = run(segs)
    assert ups[2].level >= 2, [u.score for u in ups]   # S1+S2+S3 + order bonus = 70
    assert ups[3].level == 3
    assert ups[3].s1_s5_together


def test_hindi_devanagari_scam():
    segs = ["मैं सीबीआई से बोल रहा हूँ", "आपके आधार से मनी लॉन्ड्रिंग का केस दर्ज हुआ है",
            "यह डिजिटल अरेस्ट है, किसी को मत बताइए"]
    _, ups = run(segs)
    assert ups[-1].level >= 2


def test_benign_calls_stay_quiet():
    benign = [
        ["Hello mummy, I will transfer the rent to the landlord today"],
        ["This is your bank. Your OTP is one two three four, do not share it with anyone"],
        ["Doctor's appointment is confirmed for tomorrow, please come immediately if pain increases"],
        ["I saw the police near the market yesterday, there was a lot of traffic"],
        ["Your courier is out for delivery, please keep the confidential package slip ready"],
    ]
    for segs in benign:
        sc, _ = run(segs)
        assert sc.max_level < 2, segs


def test_single_stage_never_exceeds_l1():
    sc, ups = run(["transfer the money to the safe account"])
    assert ups[0].level <= 1 or ups[0].s1_s5_together is False
    assert sc.max_level <= 1


def test_fuzzy_asr_misspelling():
    sc, ups = run(["there is a money laundring case"])
    assert "S2_accusation" in ups[0].stages_seen


def test_authority_plus_payment_is_immediate_l3():
    _, ups = run(["I am from CBI", "now send the money to the safe account"])
    assert ups[1].level == 3


def test_stage_expiry():
    sc = RiskScorer(window_s=60)
    sc.update("I am from the CBI", 0, ts=0)
    up = sc.update("hello", 1, ts=120)
    assert up.stages_seen == []


def test_levels():
    assert level_for(39) == 0 and level_for(40) == 1 and level_for(70) == 2 and level_for(90) == 3


def test_benign_rent_transfer_with_police_mention():
    # Regression: fuzzy match once turned "transfer kar dungi" into S5 and, with "police", forced L3.
    sc, _ = run(["Doctor ne kaha police verification ke baad form bharna", "Main rent transfer kar dungi shaam ko"])
    assert sc.max_level == 0


def test_structural_extortion_rules():
    # S1 (authority) + S2 (threat) + S3 (secrecy) triggers L2 even without S4/S5
    sc, ups = run([
        "Calling from Supreme Court cyber cell",
        "Arrest warrant is issued for illegal activities",
        "Do not tell your family members about this call",
    ])
    assert sc.max_level >= 2
    assert "S1_authority" in sc._seen
    assert "S2_accusation" in sc._seen
    assert "S3_isolation" in sc._seen

    # S2 (accusation) + S3 (secrecy) + S5 (bail money) triggers L2 without S1
    sc2, _ = run([
        "Accident ho gaya hai, college police ne pakad liya",
        "Papa mummy ko mat batana please",
        "Bail fee turant transfer karo",
    ])
    assert sc2.max_level >= 2


def test_verb_inflection_matching():
    # Test that verb inflections (batayein, bataiye, kijiye, karein) normalize and match
    assert normalise("apna otp batayein") == normalise("apna otp batao")
    assert normalise("kisi se baat mat kijiye") == normalise("kisi se baat mat karo")
    assert normalise("paisa transfer kijiye") == normalise("paisa transfer karo")

