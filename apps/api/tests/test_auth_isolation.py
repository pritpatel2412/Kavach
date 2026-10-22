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


def test_guardian_magic_link_login_and_refresh_rotation():
    """X5: Test guardian passwordless magic link, session issuance, and refresh token rotation."""
    from app import db
    from app.ratelimit import reset_rate_limits
    reset_rate_limits()

    with TestClient(app) as c:
        test_email = "test_guardian_x5@example.com"

        # 1. Request magic link
        r_link = c.post("/api/auth/guardian/magic-link", json={"email": test_email})
        assert r_link.status_code == 200
        assert r_link.json()["ok"] is True

        # Retrieve token hash from DB
        with db.db() as conn:
            row = conn.execute("SELECT token_hash FROM guardian_magic_tokens WHERE email=? ORDER BY created_at DESC LIMIT 1;", (test_email,)).fetchone()
            assert row is not None
            thash = row[0]

        # 2. Reject verification with bogus token
        assert c.post("/api/auth/guardian/verify", json={"token": "bogus_token_12345678"}).status_code == 400

        # Create a known raw token for deterministic verification
        import secrets, hashlib
        raw_tok = secrets.token_urlsafe(32)
        raw_hash = hashlib.sha256(raw_tok.encode("utf-8")).hexdigest()
        from datetime import datetime, timedelta, timezone
        now = datetime.now(timezone.utc)
        with db.db() as conn:
            conn.execute(
                "INSERT INTO guardian_magic_tokens (token_hash, email, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?);",
                (raw_hash, test_email, (now + timedelta(minutes=10)).isoformat(), now.isoformat()),
            )

        # 3. Verify valid magic link
        v_res = c.post("/api/auth/guardian/verify", json={"token": raw_tok})
        assert v_res.status_code == 200
        v_data = v_res.json()
        assert v_data["ok"] is True
        session_id = v_data["session_id"]
        refresh_token = v_data["refresh_token"]
        assert session_id.startswith("gsess_")
        assert refresh_token.startswith("gref_")
        assert v_data["guardian"]["email"] == test_email

        # 4. Replay verification should fail
        v_replay = c.post("/api/auth/guardian/verify", json={"token": raw_tok})
        assert v_replay.status_code == 400
        assert v_replay.json()["detail"]["error"] == "token_used"

        # 5. Access authenticated endpoint using session token
        sess_hdr = {"Authorization": f"Bearer {session_id}"}
        me_res = c.get("/api/auth/guardian/me", headers=sess_hdr)
        assert me_res.status_code == 200
        assert me_res.json()["guardian"]["email"] == test_email

        # 6. Access using cookie
        c.cookies.set("kavach_guardian_session", session_id)
        me_cookie_res = c.get("/api/auth/guardian/me")
        assert me_cookie_res.status_code == 200

        # 7. Refresh token rotation
        ref_res = c.post("/api/auth/guardian/refresh", json={"refresh_token": refresh_token})
        assert ref_res.status_code == 200
        ref_data = ref_res.json()
        new_session_id = ref_data["session_id"]
        new_refresh_token = ref_data["refresh_token"]
        assert new_session_id != session_id
        assert new_refresh_token != refresh_token

        # 8. Old refresh token is revoked and cannot be reused
        reuse_res = c.post("/api/auth/guardian/refresh", json={"refresh_token": refresh_token})
        assert reuse_res.status_code == 401
        assert reuse_res.json()["detail"]["error"] == "token_revoked"

        # 9. New session works
        new_hdr = {"Authorization": f"Bearer {new_session_id}"}
        assert c.get("/api/auth/guardian/me", headers=new_hdr).status_code == 200

        # 10. Logout revokes session
        logout_res = c.post("/api/auth/guardian/logout", headers=new_hdr)
        assert logout_res.status_code == 200
        assert c.get("/api/auth/guardian/me", headers=new_hdr).status_code == 401


def test_device_pairing_code_elder_consent_and_isolation():
    """X5: Test device pairing code generation, mandatory elder consent, and household isolation."""
    with TestClient(app) as c:
        # Create Guardian A and Guardian B
        ga_id, _, ga_hdr = _create_guardian(c, "Guardian A Pairing")
        gb_id, _, gb_hdr = _create_guardian(c, "Guardian B Pairing")

        # Create Elder A (under Guardian A) and Elder B (under Guardian B)
        ea_id = c.post("/api/elders", json={"name": "Elder A", "language": "hi-IN"}, headers=ga_hdr).json()["id"]
        eb_id = c.post("/api/elders", json={"name": "Elder B", "language": "hi-IN"}, headers=gb_hdr).json()["id"]

        # 1. Guardian A cannot create pairing code for Guardian B's elder
        cross_code = c.post("/api/devices/pairing-code", json={"elder_id": eb_id}, headers=ga_hdr)
        assert cross_code.status_code == 403
        assert cross_code.json()["detail"]["error"] == "forbidden"

        # 2. Guardian A creates pairing code for Elder A
        pair_code_res = c.post("/api/devices/pairing-code", json={"elder_id": ea_id}, headers=ga_hdr)
        assert pair_code_res.status_code == 200
        code = pair_code_res.json()["code"]
        assert len(code) == 6

        # 3. Device pairing fails if elder_consent is false (DPDP statutory compliance)
        no_consent = c.post("/api/devices/pair", json={"code": code, "elder_consent": False})
        assert no_consent.status_code == 400
        assert no_consent.json()["detail"]["error"] == "elder_consent_required"

        # 4. Device pairing succeeds with explicit elder consent
        pair_res = c.post("/api/devices/pair", json={"code": code, "elder_consent": True, "label": "Living Room Listener"})
        assert pair_res.status_code == 200
        p_data = pair_res.json()
        assert p_data["ok"] is True
        assert p_data["device_token"].startswith("kav_dev_")
        assert p_data["elder_consent_ts"] is not None
        device_id = p_data["device_id"]

        # 5. Pairing code replay fails
        replay_res = c.post("/api/devices/pair", json={"code": code, "elder_consent": True})
        assert replay_res.status_code == 400
        assert replay_res.json()["detail"]["error"] == "code_used"

        # 6. Guardian A lists devices, sees paired device
        devs_a = c.get("/api/devices", headers=ga_hdr).json()["devices"]
        assert any(d["id"] == device_id and d["elder_id"] == ea_id for d in devs_a)

        # 7. Guardian B listing devices does NOT see Guardian A's device
        devs_b = c.get("/api/devices", headers=gb_hdr).json()["devices"]
        assert not any(d["id"] == device_id for d in devs_b)

        # 8. Guardian B cannot revoke Guardian A's device
        del_b = c.delete(f"/api/devices/{device_id}", headers=gb_hdr)
        assert del_b.status_code == 404

        # 9. Guardian A can revoke device
        del_a = c.delete(f"/api/devices/{device_id}", headers=ga_hdr)
        assert del_a.status_code == 200
        assert del_a.json()["revoked"] is True


def test_guardian_phone_login_creates_real_database_session():
    """Verify phone OTP login registers guardian and issues real database session."""
    with TestClient(app) as c:
        phone_payload = {"phone": "+91 99999 12345", "otp": "123456", "name": "Verified Test Guardian"}
        res = c.post("/api/auth/guardian/phone-login", json=phone_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["session_id"].startswith("gsess_")
        session_id = data["session_id"]

        # Call /api/auth/guardian/me using the session token
        me_res = c.get("/api/auth/guardian/me", headers={"Authorization": f"Bearer {session_id}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["guardian"]["name"] == "Verified Test Guardian"


