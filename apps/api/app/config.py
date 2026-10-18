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
    stt_roll_at_s: float
    telegram_bot_token: str
    telegram_chat_id: str
    clips_dir: Path
    web_dir: Path
    fixtures_dir: Path
    db_path: Path
    public_url: str
    liveness_threshold: float
    llm_provider: str
    llm_api_key: str
    max_stt_minutes_per_day: float
    # Brand single source of truth
    brand_name: str
    brand_domain: str
    ticket_prefix: str
    # Admin settings
    admin_enabled: bool
    admin_allowed_emails: tuple[str, ...]
    admin_origin: str
    secret_key: str
    # Email settings
    email_mode: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    smtp_starttls: bool
    from_name: str
    from_email: str
    reply_to: str
    email_rate_per_min: int
    email_daily_cap: int


def get_settings() -> Settings:
    # Note on Gnani auth (S3-E): Gnani Prisma and Timbre use 'X-API-Key-ID' exclusively (via GNANI_API_KEY).
    # There is no GNANI_TOKEN in official docs (verified 13 Oct 2026 docs.gnani.ai).
    allowed_raw = os.getenv("ADMIN_ALLOWED_EMAILS", "")
    allowed_list = tuple(e.strip().lower() for e in allowed_raw.split(",") if e.strip())

    brand_name = os.getenv("BRAND_NAME", "Kavach").strip()
    brand_domain = os.getenv("BRAND_DOMAIN", "kavach.ai").strip()

    return Settings(
        gnani_api_key=os.getenv("GNANI_API_KEY", ""),
        mock_stt=_bool("KAVACH_MOCK_STT", False),
        mock_interval_s=float(os.getenv("MOCK_SEGMENT_INTERVAL_S", "4")),
        default_lang=os.getenv("DEFAULT_LANG", "hi-IN"),
        stt_vad_threshold=float(os.getenv("STT_VAD_THRESHOLD", "0.7")),
        stt_min_silence_ms=int(os.getenv("STT_MIN_SILENCE_MS", "500")),
        stt_min_speech_ms=int(os.getenv("STT_MIN_SPEECH_MS", "200")),
        echo_gate_tail_s=float(os.getenv("ECHO_GATE_TAIL_S", "0.4")),
        stt_roll_at_s=float(os.getenv("STT_ROLL_AT_S", str(14 * 60 + 30))),
        telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN", ""),
        telegram_chat_id=os.getenv("TELEGRAM_CHAT_ID", ""),
        clips_dir=Path(os.getenv("CLIPS_DIR", str(ROOT / "assets" / "clips"))),
        web_dir=ROOT / "apps" / "web",
        fixtures_dir=ROOT / "fixtures",
        db_path=Path(os.getenv("KAVACH_DB", str(ROOT / "data" / "kavach.db"))),
        public_url=os.getenv("KAVACH_PUBLIC_URL", "http://localhost:8000").rstrip("/"),
        liveness_threshold=float(os.getenv("LIVENESS_THRESHOLD", "75")),
        llm_provider=os.getenv("LLM_PROVIDER", "").strip(),
        llm_api_key=os.getenv("LLM_API_KEY", ""),
        max_stt_minutes_per_day=float(os.getenv("MAX_STT_MINUTES_PER_DAY", "30.0")),
        brand_name=brand_name,
        brand_domain=brand_domain,
        ticket_prefix=os.getenv("TICKET_PREFIX", "KAV").strip().upper(),
        admin_enabled=_bool("ADMIN_ENABLED", True),  # default True for local/dev/test; in prod deploy explicitly set
        admin_allowed_emails=allowed_list,
        admin_origin=os.getenv("ADMIN_ORIGIN", "http://localhost:3002").rstrip("/"),
        secret_key=os.getenv("KAVACH_SECRET", "kavach_secret_key_2026_non_default"),
        email_mode=os.getenv("EMAIL_MODE", "console").strip().lower(),
        smtp_host=os.getenv("SMTP_HOST", "localhost"),
        smtp_port=int(os.getenv("SMTP_PORT", "1025")),
        smtp_user=os.getenv("SMTP_USER", ""),
        smtp_pass=os.getenv("SMTP_PASS", ""),
        smtp_starttls=_bool("SMTP_STARTTLS", False),
        from_name=os.getenv("FROM_NAME", f"{brand_name} Security"),
        from_email=os.getenv("FROM_EMAIL", f"notifications@{brand_domain}"),
        reply_to=os.getenv("REPLY_TO", f"support@{brand_domain}"),
        email_rate_per_min=int(os.getenv("EMAIL_RATE_PER_MIN", "60")),
        email_daily_cap=int(os.getenv("EMAIL_DAILY_CAP", "1000")),
    )

