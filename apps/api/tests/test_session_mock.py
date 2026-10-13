"""End-to-end offline test: mock STT -> detector -> intervention -> alert, over the real WebSocket route."""
import json
import os

os.environ["KAVACH_MOCK_STT"] = "1"
os.environ["MOCK_SEGMENT_INTERVAL_S"] = "0.01"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def test_health():
    r = TestClient(app).get("/health")
    assert r.status_code == 200 and r.json()["mock_stt"] is True


def test_full_pipeline_mock():
    events = []
    with TestClient(app).websocket_connect("/ws/session?lang=en-IN") as ws:
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
