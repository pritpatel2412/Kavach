"""End-to-end offline test: mock STT -> detector -> intervention -> alert, over the real WebSocket route."""
import json
import os

os.environ["KAVACH_MOCK_STT"] = "1"
os.environ["MOCK_SEGMENT_INTERVAL_S"] = "0.01"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def test_health():
    with TestClient(app) as c:
        r = c.get("/health")
        assert r.status_code == 200 and r.json()["mock_stt"] is True


def test_full_pipeline_mock():
    events = []
    with TestClient(app) as c:
        with c.websocket_connect("/ws/session?lang=en-IN") as ws:
            for _ in range(60):
                ev = json.loads(ws.receive_text())
                events.append(ev)
                if ev["type"] == "alert_sent" and ev["level"] == 3:
                    break
    types = [e["type"] for e in events]
    assert "transcript" in types and "risk" in types
    levels = [e["level"] for e in events if e["type"] == "intervene"]
    assert levels == [2, 3], levels                         # L2 before payment demand, then L3
    risk = [e for e in events if e["type"] == "risk"]
    assert risk[2]["level"] >= 2 and risk[3]["level"] == 3
    assert all("screen_text" in e for e in events if e["type"] == "intervene")
    assert all("ttw_ms" in e for e in events if e["type"] == "intervene")
    assert any(e.get("session_id") for e in events if e["type"] == "state")


def test_replay_rejects_silent_and_empty(tmp_path):
    import wave
    from app.session import load_pcm16_mono
    import pytest

    # Empty WAV
    empty_wav = tmp_path / "empty.wav"
    with wave.open(str(empty_wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
    with pytest.raises(ValueError, match="empty"):
        load_pcm16_mono(empty_wav)

    # Completely silent WAV
    silent_wav = tmp_path / "silent.wav"
    with wave.open(str(silent_wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes(bytes(3200))  # 100ms of zeros
    with pytest.raises(ValueError, match="silent"):
        load_pcm16_mono(silent_wav)

