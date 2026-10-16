import os
from pathlib import Path

import pytest

os.environ.setdefault("KAVACH_MOCK_STT", "1")
os.environ.setdefault("MOCK_SEGMENT_INTERVAL_S", "0.01")
os.environ.setdefault("LLM_PROVIDER", "")


@pytest.fixture(autouse=True)
def _isolate(tmp_path, monkeypatch):
    monkeypatch.setenv("KAVACH_MOCK_STT", os.environ.get("KAVACH_MOCK_STT", "1"))
    monkeypatch.setenv("MOCK_SEGMENT_INTERVAL_S", "0.01")
    monkeypatch.setenv("KAVACH_DB", str(tmp_path / "kavach.db"))
    monkeypatch.setenv("CLIPS_DIR", str(tmp_path / "clips"))
    monkeypatch.setenv("LLM_PROVIDER", "")
    (tmp_path / "clips").mkdir(exist_ok=True)
    from app.db import init_db
    init_db()
    return tmp_path


@pytest.fixture
def wav_bytes():
    from app.clips import tiny_wav_bytes
    return tiny_wav_bytes()
