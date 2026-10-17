"""Tests for Guardian Bearer Authentication, Cross-Guardian Isolation, Rate Limiting, and Liveness Boundaries."""
import os
import pytest
from fastapi.testclient import TestClient

from app.clips import tiny_wav_bytes
from app.liveness import liveness_ok
from app.main import app
from app.routes_voice import _challenges


def _create_guardian(client: TestClient, name: str = "Guardian"):
    res = client.post("/api/guardians", json={"name": name, "gender": "m"}).json()
    return res["id"], res["token"], {"Authorization": f"Bearer {res['token']}"}


def test_unauthenticated_endpoints_return_401():
    with TestClient(app) as c:
        assert c.get("/api/guardians").status_code == 401
        assert c.post("/api/elders", json={"name": "E"}).status_code == 401
        assert c.get("/api/elders").status_code == 401
        assert c.get("/api/sessions").status_code == 401
        assert c.get("/api/sessions/some-id").status_code == 401
        assert c.post("/api/sessions/some-id/feedback", json={"verdict": "real"}).status_code == 401
        assert c.post("/api/voice/preview", json={"voice_profile_id": "v", "level": 2}).status_code == 401
        assert c.delete("/api/voice/v").status_code == 401


def test_invalid_bearer_token_returns_401():
    with TestClient(app) as c:
        bad_headers = {"Authorization": "Bearer invalid_revoked_token_12345"}
        assert c.get("/api/guardians", headers=bad_headers).status_code == 401
        assert c.get("/api/elders", headers=bad_headers).status_code == 401
        assert c.get("/api/sessions", headers=bad_headers).status_code == 401


def test_cross_guardian_elder_and_voice_isolation():
    with TestClient(app) as c:
        # Create Guardian A and Guardian B
        ga_id, ga_tok, ga_hdr = _create_guardian(c, "Guardian A")
        gb_id, gb_tok, gb_hdr = _create_guardian(c, "Guardian B")

        # Guardian A creates Elder A
        ea_res = c.post("/api/elders", json={"name": "Elder A", "language": "hi-IN"}, headers=ga_hdr)
        assert ea_res.status_code == 200
        ea_id = ea_res.json()["id"]

        # Guardian B creates Elder B
        eb_res = c.post("/api/elders", json={"name": "Elder B", "language": "hi-IN"}, headers=gb_hdr)
        assert eb_res.status_code == 200
        eb_id = eb_res.json()["id"]

        # Guardian A cannot create an elder for Guardian B's account
        forbidden_elder = c.post("/api/elders", json={"guardian_id": gb_id, "name": "Hack Elder"}, headers=ga_hdr)
        assert forbidden_elder.status_code == 403

        # Guardian A listing elders sees only Elder A, not Elder B
        ga_elders = c.get("/api/elders", headers=ga_hdr).json()["elders"]
        assert any(e["id"] == ea_id for e in ga_elders)
        assert not any(e["id"] == eb_id for e in ga_elders)

        # Guardian B listing elders sees only Elder B, not Elder A
        gb_elders = c.get("/api/elders", headers=gb_hdr).json()["elders"]
        assert any(e["id"] == eb_id for e in gb_elders)
        assert not any(e["id"] == ea_id for e in gb_elders)

        # Guardian A enrolls voice for Elder A
        ch = c.get("/api/voice/challenge").json()
        _challenges[ch["challenge_id"]] = (ch["sentence"], 1e18)
        va_res = c.post("/api/voice/enroll", data={
            "challenge_id": ch["challenge_id"], "guardian_id": ga_id, "elder_id": ea_id, "consent": "true",
        }, headers=ga_hdr, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert va_res.status_code == 200
        va_id = va_res.json()["voice_profile_id"]

        # Guardian B CANNOT enroll voice for Elder A (cross-guardian access rejected with 403)
        ch2 = c.get("/api/voice/challenge").json()
        _challenges[ch2["challenge_id"]] = (ch2["sentence"], 1e18)
        vb_hack = c.post("/api/voice/enroll", data={
            "challenge_id": ch2["challenge_id"], "guardian_id": gb_id, "elder_id": ea_id, "consent": "true",
        }, headers=gb_hdr, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert vb_hack.status_code == 403

        # Guardian B CANNOT preview Guardian A's voice profile
        prev_hack = c.post("/api/voice/preview", json={"voice_profile_id": va_id, "level": 2}, headers=gb_hdr)
        assert prev_hack.status_code == 403

        # Guardian B CANNOT delete Guardian A's voice profile
        del_hack = c.delete(f"/api/voice/{va_id}", headers=gb_hdr)
        assert del_hack.status_code == 403

        # Guardian A CAN preview and delete own voice profile
        prev_ok = c.post("/api/voice/preview", json={"voice_profile_id": va_id, "level": 2}, headers=ga_hdr)
        assert prev_ok.status_code == 200
        del_ok = c.delete(f"/api/voice/{va_id}", headers=ga_hdr)
        assert del_ok.status_code == 200 and del_ok.json()["deleted"] is True


def test_cross_guardian_session_timeline_isolation():
    from app import db
    with TestClient(app) as c:
        ga_id, _, ga_hdr = _create_guardian(c, "Guardian A")
        gb_id, _, gb_hdr = _create_guardian(c, "Guardian B")

        ea_id = c.post("/api/elders", json={"name": "Elder A", "language": "hi-IN"}, headers=ga_hdr).json()["id"]
        eb_id = c.post("/api/elders", json={"name": "Elder B", "language": "hi-IN"}, headers=gb_hdr).json()["id"]

        # Create session for Elder A and Elder B
        sa_id = db.insert_session(ea_id, synthetic=True)
        db.insert_event(sa_id, 0, "Test alert excerpt", ["S1_authority"], 15, 0)
        sb_id = db.insert_session(eb_id, synthetic=True)

        # Guardian A can read Session A
        res_a = c.get(f"/api/sessions/{sa_id}", headers=ga_hdr)
        assert res_a.status_code == 200

        # Guardian B CANNOT read Session A (cross-guardian access rejected with 403)
        res_b_hack = c.get(f"/api/sessions/{sa_id}", headers=gb_hdr)
        assert res_b_hack.status_code == 403

        # Guardian B CANNOT submit feedback on Session A
        fb_hack = c.post(f"/api/sessions/{sa_id}/feedback", json={"verdict": "real"}, headers=gb_hdr)
        assert fb_hack.status_code == 403

        # Guardian A listing sessions sees only Session A, never Session B
        sess_list_a = c.get("/api/sessions", headers=ga_hdr).json()["sessions"]
        assert any(s["id"] == sa_id for s in sess_list_a)
        assert not any(s["id"] == sb_id for s in sess_list_a)


def test_liveness_threshold_boundary():
    expected = "Namaste mera naam Kavach hai aur main parivaar ki suraksha ke liye bol raha hoon"
    # Exact match: 100%
    assert liveness_ok(expected, expected, 75.0) is True

    # High match (one word missing: score ~96.7%)
    close = "Namaste mera naam Kavach hai aur parivaar ki suraksha ke liye bol raha hoon"
    assert liveness_ok(close, expected, 75.0) is True

    # Low match (score ~30%)
    distant = "Hello this is completely different words with no match"
    assert liveness_ok(distant, expected, 75.0) is False

    # Short fragment (< 50% length) rejected regardless
    assert liveness_ok("Namaste mera", expected, 10.0) is False

    # Boundary check at strict 98% threshold
    assert liveness_ok(close, expected, 98.0) is False
    assert liveness_ok(expected, expected, 98.0) is True

    # Empty inputs
    assert liveness_ok("", expected, 50.0) is False
    assert liveness_ok(expected, "", 50.0) is False


def test_rate_limiting_challenge_endpoint():
    from app.ratelimit import reset_rate_limits
    reset_rate_limits()
    try:
        with TestClient(app) as c:
            # We can call within limit
            r = c.get("/api/voice/challenge")
            assert r.status_code == 200

            # Flooding requests triggers 429
            rate_limited = False
            for _ in range(35):
                res = c.get("/api/voice/challenge")
                if res.status_code == 429:
                    rate_limited = True
                    assert res.json()["detail"]["error"] == "rate_limited"
                    break
            assert rate_limited, "Expected 429 rate_limited after excessive calls"
    finally:
        reset_rate_limits()


def test_mock_disabled_when_kavach_mock_stt_zero(monkeypatch):
    monkeypatch.setenv("KAVACH_MOCK_STT", "0")
    monkeypatch.setenv("GNANI_API_KEY", "")
    with TestClient(app) as c:
        ga_id, _, ga_hdr = _create_guardian(c, "Guardian A")
        ea_id = c.post("/api/elders", json={"name": "Elder A", "language": "hi-IN"}, headers=ga_hdr).json()["id"]
        ch = c.get("/api/voice/challenge").json()
        _challenges[ch["challenge_id"]] = (ch["sentence"], 1e18)
        # Attempting mock enrollment when KAVACH_MOCK_STT=0 without key must fail (server-enforced)
        with pytest.raises(Exception):
            c.post("/api/voice/enroll", data={
                "challenge_id": ch["challenge_id"], "guardian_id": ga_id, "elder_id": ea_id, "consent": "true",
            }, headers=ga_hdr, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
