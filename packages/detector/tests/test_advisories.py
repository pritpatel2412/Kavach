"""Tests for S3-B: Awareness, PSA, and news negation in Hindi, Hinglish, and English."""
import pytest
from kavach_detector import RiskScorer
from kavach_detector.advisories import is_genuine_advisory


def test_awareness_and_psa_negation_hinglish():
    scorer = RiskScorer()
    
    # 1. Digital arrest awareness campaign
    up = scorer.update("Digital arrest ek scam hai dosto, CBI ya police kabhi aisi call nahi karti, savdhan rahein.")
    assert up.score == 0
    assert up.level == 0
    assert len(up.hits) == 0

    # 2. RBI Kehta Hai advisory
    up = scorer.update("RBI kehta hai, kisi bhi anjaan vyakti ko apna OTP, PIN ya password share mat karein.")
    assert up.score == 0
    assert up.level == 0


def test_awareness_and_psa_negation_hindi():
    scorer = RiskScorer()
    
    # Devanagari awareness
    up = scorer.update("डिजिटल अरेस्ट एक फर्जीवाड़ा है। पुलिस कभी वीडियो कॉल पर अरेस्ट नहीं करती। जनहित में जारी।")
    assert up.score == 0
    assert up.level == 0

    # RBI Kehta Hai in Hindi
    up = scorer.update("आरबीआई कहता है: सतर्क रहें, किसी को बैंक विवरण या ओटीपी न बताएं।")
    assert up.score == 0
    assert up.level == 0


def test_news_bulletin_negation_english():
    scorer = RiskScorer()
    
    # News report about CBI raids
    up = scorer.update("In today's news bulletin: CBI conducted raids across 15 locations and arrested cyber fraudsters involved in parcel scam.")
    assert up.score == 0
    assert up.level == 0

    # Police warning advisory
    up = scorer.update("Police advisory: beware of fake calls demanding immediate money transfer to safe bank accounts.")
    assert up.score == 0
    assert up.level == 0


def test_is_genuine_advisory_helper():
    assert is_genuine_advisory("digital arrest ek scam hai") is True
    assert is_genuine_advisory("cbi raided call center") is True
    assert is_genuine_advisory("never share your pin or otp") is True
    assert is_genuine_advisory("aapke khate se paisa transfer karo abhi") is False
