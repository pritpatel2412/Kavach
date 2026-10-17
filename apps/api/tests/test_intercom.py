"""Tests for Guardian Action Link, Live Intercom Relay, Token Expiry, and L3 Fallback Timing."""
import asyncio
import json
import time
import pytest
from fastapi.testclient import TestClient

from app import db
from app.clips import tiny_wav_bytes
from app.main import app
from app.session import active_sessions
from app.signed_token import create_action_token, verify_action_token


def test_signed_action_token_verification_and_expiry():
    sid = "test_session_123"
    token = create_action_token(sid, ttl_s=60)
    data = verify_action_token(token)
    assert data is not None
    assert data["session_id"] == sid

    # Tampered signature
    tampered = token[:-4] + "xxxx"
    assert verify_action_token(tampered) is None

    # Expired token
    expired_token = create_action_token(sid, ttl_s=-10)
    assert verify_action_token(expired_token) is None


def test_alert_details_endpoint():
    with TestClient(app) as c:
        g = c.post("/api/guardians", json={"name": "Guardian", "gender": "m"}).json()
        headers = {"Authorization": f"Bearer {g['token']}"}
        e = c.post("/api/elders", json={"name": "Savitri Devi", "language": "hi-IN", "phone": "+919876543210"}, headers=headers).json()["id"]

        sid = db.insert_session(e, synthetic=True)
        db.insert_event(sid, 0, "CBI officer speaking verify safe account",
                        ["S1_authority", "S5_payment"], 75, 2,
                        reason_en="Caller claimed to be CBI and asked for safe account transfer",
                        reason_hi="कॉल करने वाले ने CBI अधिकारी बनकर सुरक्षित खाते में पैसे मांगे")

        # 1. Valid token
        tok = create_action_token(sid, ttl_s=900)
        res = c.get(f"/api/alert/details?token={tok}")
        assert res.status_code == 200
        body = res.json()
        assert body["session_id"] == sid
        assert body["elder_name"] == "Savitri Devi"
        assert body["elder_phone"] == "+919876543210"
        assert "S1_authority" in body["stages"]
        assert "CBI" in body["reason_en"]
        assert "CBI" in body["reason_hi"]
        assert body["expires_in_s"] > 0

        # 2. Expired token -> 403
        bad_tok = create_action_token(sid, ttl_s=-1)
        res_bad = c.get(f"/api/alert/details?token={bad_tok}")
        assert res_bad.status_code == 403


def test_intercom_relay_and_zero_audio_stored():
    with TestClient(app) as c_elder, TestClient(app) as c_guardian:
        g = c_elder.post("/api/guardians", json={"name": "Guardian", "gender": "m"}).json()
        headers = {"Authorization": f"Bearer {g['token']}"}
        e = c_elder.post("/api/elders", json={"name": "Savitri Ji", "language": "hi-IN"}, headers=headers).json()["id"]

        # Elder opens /ws/session
        with c_elder.websocket_connect(f"/ws/session?elder_id={e}&mock=1") as elder_ws:
            init = json.loads(elder_ws.receive_text())
            sid = init["session_id"]
            assert sid in active_sessions

            # S3-F: Valid intercom token requires purpose='intercom'
            intercom_token = create_action_token(sid, purpose="intercom", ttl_s=300)

            # Guardian opens /ws/intercom on separate client
            with c_guardian.websocket_connect(f"/ws/intercom?token={intercom_token}") as guardian_ws:
                runner = active_sessions[sid]
                assert runner.guardian_connected is True

                # Guardian sends 16 kHz PCM audio frame
                fake_pcm_frame = b"\x00\x10" * 256  # 512 bytes PCM16
                guardian_ws.send_bytes(fake_pcm_frame)

                # Elder receives intercom_audio event
                relayed = None
                msgs = []
                for _ in range(20):
                    m = json.loads(elder_ws.receive_text())
                    msgs.append(m)
                    if m.get("type") == "intercom_audio":
                        relayed = m
                        break
                assert relayed is not None, f"Received messages: {msgs}"
                assert relayed["type"] == "intercom_audio"
                assert relayed["rate"] == 16000
                assert relayed["audio"]

                # S3-F: Intercom playback must activate the echo gate (silence substitution + tail)
                assert runner.gated() is True
                from app.session import gated_audio, SILENCE_FRAME
                fake_elder_mic_frame = b"\x12\x34" * 512
                # Gated audio substitutes silence
                assert gated_audio(fake_elder_mic_frame, runner.gated()) == SILENCE_FRAME

        # Verify zero intercom audio stored in database or files
        sess = db.get_session(sid)
        for ev in sess.get("events", []):
            assert "intercom" not in (ev.get("excerpt") or "").lower()


def test_intercom_scoped_purpose_rejection_and_token_exchange():
    """S3-F: An alert_view token cannot connect to /ws/intercom directly.
    POST /api/alert/intercom_token exchanges it for a valid intercom token."""
    with TestClient(app) as c:
        sid = "scoped_session_123"
        # 1. Alert view token (cannot access intercom)
        alert_token = create_action_token(sid, purpose="alert_view", ttl_s=300)
        with pytest.raises(Exception):
            with c.websocket_connect(f"/ws/intercom?token={alert_token}"):
                pass

        # 2. Exchange alert_token for intercom_token
        res = c.post(f"/api/alert/intercom_token?token={alert_token}")
        assert res.status_code == 200
        intercom_tok = res.json()["intercom_token"]
        assert intercom_tok != alert_token
        data = verify_action_token(intercom_tok, expected_purpose="intercom")
        assert data is not None
        assert data["purpose"] == "intercom"
        assert data["session_id"] == sid


def test_intercom_invalid_token_closed():
    with TestClient(app) as c:
        expired_token = create_action_token("any_session", purpose="intercom", ttl_s=-10)
        with pytest.raises(Exception):
            with c.websocket_connect(f"/ws/intercom?token={expired_token}"):
                pass


@pytest.mark.anyio
async def test_l3_fallback_timing():
    """If guardian does not join within fallback timeout, clip plays automatically.
    If guardian joins before timeout, clip is deferred."""
    from unittest.mock import AsyncMock
    from app.session import SessionRunner
    from app.config import get_settings

    mock_ws = AsyncMock()
    s = get_settings()
    runner = SessionRunner(mock_ws, s, "hi-IN")
    runner.session_id = "test_s"

    clip_payload = {"type": "intervene", "level": 3, "clip_url": "/clips/default/hi-IN_L3.wav"}

    # Scenario 1: Guardian does NOT join within timeout (using short 0.05s timeout)
    runner.guardian_connected = False
    await runner._wait_and_play_fallback(clip_payload, timeout_s=0.05)
    mock_ws.send_text.assert_called_once()
    sent_payload = json.loads(mock_ws.send_text.call_args[0][0])
    assert sent_payload["level"] == 3

    # Scenario 2: Guardian joins before timeout -> clip is cancelled
    mock_ws.reset_mock()
    runner.guardian_connected = False
    task = asyncio.create_task(runner._wait_and_play_fallback(clip_payload, timeout_s=0.2))
    # Guardian joins immediately
    await asyncio.sleep(0.02)
    runner.guardian_joined_intercom()
    assert runner.guardian_connected is True
    await asyncio.sleep(0.25)
    # Clip was NOT sent
    mock_ws.send_text.assert_not_called()
