"""Settings from environment (.env supported). Read per call so tests can monkeypatch env."""
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / ".env")


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    gnani_api_key: str
    mock_stt: bool
    mock_interval_s: float
    default_lang: str
    stt_vad_threshold: float
    stt_min_silence_ms: int
    stt_min_speech_ms: int
    echo_gate_tail_s: float
    telegram_bot_token: str
    telegram_chat_id: str
    clips_dir: Path
    web_dir: Path
    fixtures_dir: Path


def get_settings() -> Settings:
    return Settings(
        gnani_api_key=os.getenv("GNANI_API_KEY", ""),
        mock_stt=_bool("KAVACH_MOCK_STT", False),
        mock_interval_s=float(os.getenv("MOCK_SEGMENT_INTERVAL_S", "4")),
        default_lang=os.getenv("DEFAULT_LANG", "hi-IN"),
        stt_vad_threshold=float(os.getenv("STT_VAD_THRESHOLD", "0.7")),
        stt_min_silence_ms=int(os.getenv("STT_MIN_SILENCE_MS", "500")),
        stt_min_speech_ms=int(os.getenv("STT_MIN_SPEECH_MS", "200")),
        echo_gate_tail_s=float(os.getenv("ECHO_GATE_TAIL_S", "0.4")),
        telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN", ""),
        telegram_chat_id=os.getenv("TELEGRAM_CHAT_ID", ""),
        clips_dir=Path(os.getenv("CLIPS_DIR", str(ROOT / "assets" / "clips"))),
        web_dir=ROOT / "apps" / "web",
        fixtures_dir=ROOT / "fixtures",
    )
