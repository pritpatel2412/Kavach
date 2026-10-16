"""Guardian onboard -> enroll (fakes) -> mock session -> timeline -> feedback -> delete."""
import json
import os

os.environ["KAVACH_MOCK_STT"] = "1"
os.environ["MOCK_SEGMENT_INTERVAL_S"] = "0.01"

from fastapi.testclient import TestClient

from app.clips import tiny_wav_bytes
from app.main import app
from app.routes_voice import _challenges


def test_e2e_offline_guardian_session_timeline_delete():
    with TestClient(app) as c:
        g = c.post("/api/guardians", json={"name": "Ravi", "gender": "m",
                                           "telegram_chat_id": ""}).json()["id"]
        e = c.post("/api/elders", json={"guardian_id": g, "name": "Savitri",
                                        "language": "en-IN"}).json()["id"]
        ch = c.get("/api/voice/challenge").json()
        _challenges[ch["challenge_id"]] = (ch["sentence"], 1e18)
        en = c.post("/api/voice/enroll", data={
            "challenge_id": ch["challenge_id"], "guardian_id": g, "elder_id": e, "consent": "true",
        }, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert en.status_code == 200, en.text
        vid = en.json()["voice_profile_id"]
        clip_urls = {cl["level"]: cl["url"] for cl in en.json()["clips"]}
        assert 2 in clip_urls and 3 in clip_urls

        events = []
        session_id = None
        with c.websocket_connect(f"/ws/session?lang=en-IN&elder_id={e}&replay=demo_scam_hinglish.wav") as ws:
            for _ in range(80):
                ev = json.loads(ws.receive_text())
                events.append(ev)
                if ev["type"] == "state" and ev.get("session_id"):
                    session_id = ev["session_id"]
                if ev["type"] == "alert_sent" and ev["level"] == 3:
                    break
        types = [e["type"] for e in events]
        assert "transcript" in types and "risk" in types
        assert all("session_id" in e for e in events if e["type"] == "risk")
        intervene = [e for e in events if e["type"] == "intervene"]
        levels = [e["level"] for e in intervene]
        assert levels == [2, 3], levels
        assert intervene[0]["clip_url"] == clip_urls[2]
        assert intervene[1]["clip_url"] == clip_urls[3]
        assert all("ttw_ms" in e for e in intervene)
        assert any(e["type"] == "alert_sent" for e in events)
        assert session_id

        tl = c.get(f"/api/sessions/{session_id}")
        assert tl.status_code == 200
        body = tl.json()
        assert body["events"] and all(len(ev["excerpt"]) <= 160 for ev in body["events"])
        assert body["alerts"]
        fb = c.post(f"/api/sessions/{session_id}/feedback", json={"verdict": "real"})
        assert fb.json() == {"ok": True}
        assert c.get(f"/api/sessions/{session_id}").json()["feedback"] == "real"

        d = c.delete(f"/api/voice/{vid}")
        assert d.json() == {"deleted": True}
        from app.config import get_settings
        assert not (get_settings().clips_dir / vid / "en-IN_L2.wav").exists()


def test_replay_mock_uses_fixture_transcripts():
    with TestClient(app) as c:
        with c.websocket_connect("/ws/session?lang=en-IN&replay=demo_scam_hinglish.wav") as ws:
            first = json.loads(ws.receive_text())
            assert first["type"] == "state" and first["session_id"]
            saw_tr = False
            for _ in range(20):
                ev = json.loads(ws.receive_text())
                if ev["type"] == "transcript":
                    saw_tr = True
                    assert "CBI" in ev["text"] or "cbi" in ev["text"].lower() or "office" in ev["text"].lower()
                    break
            assert saw_tr
