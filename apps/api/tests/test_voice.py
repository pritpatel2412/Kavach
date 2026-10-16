import logging

from fastapi.testclient import TestClient

from app.clips import tiny_wav_bytes
from app.liveness import liveness_ok
from app.main import app
from app.routes_voice import _challenges


def _client():
    return TestClient(app)


def _enroll_setup(c, monkeypatch, mock=True):
    if not mock:
        monkeypatch.setenv("KAVACH_MOCK_STT", "0")
        monkeypatch.setenv("GNANI_API_KEY", "test-key")
    g = c.post("/api/guardians", json={"name": "Ravi", "gender": "m"}).json()["id"]
    e = c.post("/api/elders", json={"guardian_id": g, "name": "Savitri", "language": "hi-IN"}).json()["id"]
    ch = c.get("/api/voice/challenge").json()
    return g, e, ch


def test_liveness_fuzzy():
    sent = "Please read this sentence clearly: I consent to clone my own voice to warn my family."
    assert liveness_ok(sent, sent, 75)
    assert liveness_ok("please read this sentence clearly i consent to clone my own voice", sent, 70)
    assert not liveness_ok("totally different words here", sent, 75)


def test_consent_required():
    with _client() as c:
        g, e, ch = _enroll_setup(c, None)
        r = c.post("/api/voice/enroll", data={
            "challenge_id": ch["challenge_id"], "guardian_id": g, "elder_id": e, "consent": "false",
        }, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert r.status_code == 400 and r.json()["detail"]["error"] == "consent_required"


def test_challenge_invalid():
    with _client() as c:
        g, e, ch = _enroll_setup(c, None)
        r = c.post("/api/voice/enroll", data={
            "challenge_id": "nope", "guardian_id": g, "elder_id": e, "consent": "true",
        }, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert r.status_code == 400 and r.json()["detail"]["error"] == "challenge_invalid"


def test_wrong_phrase(monkeypatch):
    async def fake_tr(*a, **k):
        return "this is not the challenge sentence at all"

    monkeypatch.setattr("app.gnani.stt_rest.transcribe_file", fake_tr)
    with _client() as c:
        g, e, ch = _enroll_setup(c, monkeypatch, mock=False)
        r = c.post("/api/voice/enroll", data={
            "challenge_id": ch["challenge_id"], "guardian_id": g, "elder_id": e, "consent": "true",
        }, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert r.status_code == 400 and r.json()["detail"]["error"] == "liveness_failed"


def test_enroll_success_stores_clips_and_never_logs_embedding(monkeypatch, caplog, tmp_path):
    secret = "EMB_SECRET_TOKEN_SHOULD_NEVER_LOG"

    async def fake_emb(*a, **k):
        return {"embedding": secret, "shape": [1, 768], "dtype": "torch.bfloat16"}

    async def fake_syn(*a, **k):
        return tiny_wav_bytes()

    monkeypatch.setattr("app.gnani.tts.create_embedding", fake_emb)
    monkeypatch.setattr("app.gnani.tts.synthesize_cloned", fake_syn)
    caplog.set_level(logging.DEBUG)

    with _client() as c:
        g, e, ch = _enroll_setup(c, monkeypatch, mock=False)
        # re-seed challenge because fake_tr may have consumed from map; enroll pops it
        _challenges[ch["challenge_id"]] = (ch["sentence"], 1e18)

        async def fake_tr2(*a, **k):
            return ch["sentence"]
        monkeypatch.setattr("app.gnani.stt_rest.transcribe_file", fake_tr2)

        r = c.post("/api/voice/enroll", data={
            "challenge_id": ch["challenge_id"], "guardian_id": g, "elder_id": e, "consent": "true",
        }, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["voice_profile_id"] and len(body["clips"]) == 3
        vid = body["voice_profile_id"]
        for clip in body["clips"]:
            assert clip["url"].endswith(f"_L{clip['level']}.wav")
        prev = c.post("/api/voice/preview", json={"voice_profile_id": vid, "level": 2})
        assert prev.status_code == 200 and prev.headers["content-type"] == "audio/wav"

        # files exist
        from app.config import get_settings
        clips_dir = get_settings().clips_dir
        assert (clips_dir / vid / "hi-IN_L2.wav").is_file()

        d = c.delete(f"/api/voice/{vid}")
        assert d.json() == {"deleted": True}
        assert not (clips_dir / vid / "hi-IN_L2.wav").exists()

    text = caplog.text
    assert secret not in text
    assert "EMB_SECRET" not in text


def test_mock_enroll_zero_gnani():
    with _client() as c:
        g, e, ch = _enroll_setup(c, None, mock=True)
        r = c.post("/api/voice/enroll", data={
            "challenge_id": ch["challenge_id"], "guardian_id": g, "elder_id": e, "consent": "true",
        }, files={"audio_file": ("a.wav", tiny_wav_bytes(), "audio/wav")})
        assert r.status_code == 200
        assert r.json()["clips"][0]["url"]
