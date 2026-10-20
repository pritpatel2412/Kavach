"""Unit tests for X9 contest path: demo launcher, human voice replay, replays API, and runbook."""
import json
import subprocess
import sys
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from scripts.live_check import calculate_credits, STT_CREDITS_PER_MINUTE, TTS_CREDITS_PER_500_CHARS

client = TestClient(app)
ROOT = Path(__file__).resolve().parents[3]


def test_api_replays_endpoint():
    """Verify /api/replays returns list of available synthetic and human voice files."""
    res = client.get("/api/replays")
    assert res.status_code == 200
    data = res.json()
    assert "replays" in data
    assert len(data["replays"]) >= 1
    names = [r["name"] for r in data["replays"]]
    assert "demo_scam_hinglish.wav" in names
    item = next(r for r in data["replays"] if r["name"] == "demo_scam_hinglish.wav")
    assert item["type"] == "synthetic"
    assert "Hinglish" in item["label"]


def test_ws_session_with_replay():
    """Verify websocket session handles replay parameter and fires stages and interventions."""
    events = []
    with client.websocket_connect("/ws/session?mock=1&replay=demo_scam_hinglish.wav") as ws:
        for _ in range(30):
            try:
                msg = ws.receive_text()
                ev = json.loads(msg)
                events.append(ev)
                if ev.get("type") == "intervene" and ev.get("level") == 3:
                    break
            except Exception:
                break

    types = [e.get("type") for e in events]
    assert "state" in types
    assert "transcript" in types
    assert "risk" in types

    risk_events = [e for e in events if e.get("type") == "risk"]
    assert any(e.get("score", 0) >= 70 for e in risk_events)


def test_credit_calculation_formula():
    """Verify credit calculation strictly follows docs/CREDITS_LOG.md measured rates."""
    assert STT_CREDITS_PER_MINUTE == 1.5
    assert TTS_CREDITS_PER_500_CHARS == 0.5

    # 60s audio + 0 chars TTS = 1.5 credits
    assert calculate_credits(60.0, 0) == 1.50

    # 120s audio + 500 chars TTS = 3.0 + 0.5 = 3.5 credits
    assert calculate_credits(120.0, 500) == 3.50

    # 0s audio + 250 chars TTS = 0.25 credits
    assert calculate_credits(0.0, 250) == 0.25


def test_demo_runbook_documentation_completeness():
    """Verify docs/DEMO_RUNBOOK.md exists and covers all required contest guidelines."""
    runbook_path = ROOT / "docs" / "DEMO_RUNBOOK.md"
    assert runbook_path.is_file(), "docs/DEMO_RUNBOOK.md must exist"
    content = runbook_path.read_text(encoding="utf-8")

    assert "run.ps1 demo" in content
    assert "3-Rehearsal Checklist" in content
    assert "Rehearsal 1" in content
    assert "Rehearsal 2" in content
    assert "Rehearsal 3" in content
    assert "Human Voice Replay Guide" in content
    assert "Failure Contingency Matrix" in content
    assert "Wi-Fi" in content or "Internet" in content
    assert "Gnani API Outage" in content
    assert "Browser Mic Permission Denied" in content


def test_replay_human_voice_cli_fast():
    """Verify scripts/replay_human_voice.py executes cleanly in fast benchmark mode."""
    script_path = ROOT / "scripts" / "replay_human_voice.py"
    res = subprocess.run([sys.executable, str(script_path), "--fast"], cwd=str(ROOT), capture_output=True, text=True)
    assert res.returncode == 0
    assert "KAVACH HUMAN VOICE REPLAY PIPELINE RUNNER" in res.stdout
    assert "Time-to-Warning:" in res.stdout
    assert "Fund Transfer Blocked: [YES]" in res.stdout


def test_live_check_dry_run():
    """Verify scripts/live_check.py --dry-run completes cleanly offline with zero credits."""
    script_path = ROOT / "scripts" / "live_check.py"
    res = subprocess.run([sys.executable, str(script_path), "--dry-run"], cwd=str(ROOT), capture_output=True, text=True)
    assert res.returncode == 0
    assert "KAVACH GNANI AI SMOKE TEST [DRY-RUN (OFFLINE)]" in res.stdout
    assert "[SUCCESS] Smoke test completed successfully!" in res.stdout
