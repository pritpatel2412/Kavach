import json
import pytest

from app.gnani.stt_stream import build_headers, sanitize_bias_list
from app.gnani.tts import normalise_embedding


def test_headers_match_docs():
    h = build_headers("KEY", "hi-IN", sample_rate=8000, bias_list=["CBI", "वारंट"], bias_score=1.0,
                      vad_threshold=0.7, min_silence_ms=500, min_speech_ms=200)
    assert h["x-api-key-id"] == "KEY" and h["lang_code"] == "hi-IN"
    assert h["x-sample-rate"] == "8000" and h["x-format"] == "verbatim"
    assert h["x-bias-score"] == "1.0"
    assert "\\u" in h["x-bias-list"] and h["x-bias-list"].isascii()      # header-safe \u escapes
    assert json.loads(h["x-bias-list"])[1] == "वारंट"


def test_bias_sanitiser_drops_invalid_words():
    assert sanitize_bias_list(["CBI", "two words", "abc123", "tra!", "TRAI", "cbi"]) == ["CBI", "TRAI"]


def test_bad_sample_rate_and_score():
    with pytest.raises(ValueError):
        build_headers("k", "hi-IN", sample_rate=12345)
    with pytest.raises(ValueError):
        build_headers("k", "hi-IN", bias_list=["CBI"], bias_score=3.0)


def test_no_bias_headers_when_list_empty():
    h = build_headers("k", "hi-IN", bias_list=["bad word"])
    assert "x-bias-list" not in h and "x-bias-score" not in h


def test_embedding_both_shapes():
    flat = {"embedding": "abc", "shape": [1, 768], "dtype": "torch.bfloat16"}
    nested = {"success": True, "data": {"voice_clone_embedding": flat}}
    assert normalise_embedding(flat) == normalise_embedding(nested) == flat
    with pytest.raises(ValueError):
        normalise_embedding({"foo": 1})
