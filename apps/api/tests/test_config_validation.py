"""Tests for fail-fast startup configuration validation per deployment mode."""
from pathlib import Path
import pytest

from app.config import Settings, validate_config

ROOT = Path(__file__).resolve().parents[3]


def make_settings(**overrides) -> Settings:
    defaults = dict(
        deploy_mode="local",
        gnani_api_key="",
        mock_stt=True,
        mock_interval_s=4.0,
        default_lang="hi-IN",
        stt_vad_threshold=0.7,
        stt_min_silence_ms=500,
        stt_min_speech_ms=200,
        echo_gate_tail_s=0.4,
        stt_roll_at_s=870.0,
        telegram_bot_token="",
        telegram_chat_id="",
        clips_dir=ROOT / "assets" / "clips",
        web_dir=ROOT / "apps" / "web",
        fixtures_dir=ROOT / "fixtures",
        db_path=ROOT / "data" / "kavach.db",
        public_url="http://localhost:8000",
        public_site_url="http://localhost:3000",
        liveness_threshold=75.0,
        llm_provider="",
        llm_api_key="",
        max_stt_minutes_per_day=30.0,
        brand_name="Kavach",
        brand_domain="kavach.ai",
        ticket_prefix="KAV",
        github_repo_url="https://github.com/pritpatel2412/Kavach",
        admin_enabled=True,
        admin_allowed_emails=(),
        admin_origin="http://localhost:3002",
        secret_key="dev_insecure_default_secret",
        email_mode="console",
        smtp_host="localhost",
        smtp_port=1025,
        smtp_user="",
        smtp_pass="",
        smtp_starttls=False,
        from_name="Kavach Security",
        from_email="notifications@kavach.ai",
        reply_to="support@kavach.ai",
        email_rate_per_min=60,
        email_daily_cap=1000,
        database_url=None,
        database_url_unpooled=None,
        neon_branch="production",
        neon_auth_base_url=None,
        neon_auth_jwks_url=None,
        neon_ai_gateway_base_url=None,
        neon_ai_gateway_token=None,
    )
    defaults.update(overrides)
    return Settings(**defaults)


def test_validate_config_local_passes():
    s = make_settings(deploy_mode="local")
    # Should not raise in local dev mode
    validate_config(s)


def test_validate_config_prod_requires_strong_secret():
    s = make_settings(
        deploy_mode="production",
        secret_key="dev_insecure_default_secret",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="smtp",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=False,
    )
    with pytest.raises(RuntimeError, match="KAVACH_SECRET"):
        validate_config(s)


def test_validate_config_prod_requires_postgres_with_ssl():
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url=None,  # missing
        email_mode="smtp",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=False,
    )
    with pytest.raises(RuntimeError, match="DATABASE_URL is required"):
        validate_config(s)

    s_no_ssl = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db",  # no sslmode=require
        email_mode="smtp",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=False,
    )
    with pytest.raises(RuntimeError, match="must require SSL"):
        validate_config(s_no_ssl)


def test_validate_config_prod_requires_smtp():
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="console",  # forbidden
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=False,
    )
    with pytest.raises(RuntimeError, match="EMAIL_MODE must be 'smtp'"):
        validate_config(s)


def test_validate_config_prod_forbids_localhost_urls():
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="smtp",
        public_url="http://localhost:8000",  # localhost forbidden
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=False,
    )
    with pytest.raises(RuntimeError, match="PUBLIC_URL cannot point to localhost"):
        validate_config(s)


def test_validate_config_prod_forbids_mock_stt():
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="smtp",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=True,  # forbidden
        admin_enabled=False,
    )
    with pytest.raises(RuntimeError, match="KAVACH_MOCK_STT cannot be enabled"):
        validate_config(s)


def test_validate_config_prod_requires_admin_allowed_emails():
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="smtp",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=True,
        admin_allowed_emails=(),  # empty forbidden when enabled
    )
    with pytest.raises(RuntimeError, match="ADMIN_ALLOWED_EMAILS cannot be empty"):
        validate_config(s)


def test_validate_config_prod_valid_passes():
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="smtp",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=False,
        admin_enabled=True,
        admin_allowed_emails=("ops@kavach.ai",),
    )
    # Must pass without error
    validate_config(s)


def test_validate_config_prod_allows_console_and_mock_when_explicitly_flagged(monkeypatch):
    monkeypatch.setenv("ALLOW_CONSOLE_EMAIL", "1")
    monkeypatch.setenv("ALLOW_PROD_MOCK", "1")
    s = make_settings(
        deploy_mode="production",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="console",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=True,
        admin_enabled=True,
        admin_allowed_emails=("ops@kavach.ai",),
    )
    # Must pass without error when flags are set
    validate_config(s)


def test_validate_config_staging_passes():
    s = make_settings(
        deploy_mode="staging",
        secret_key="a_very_secure_high_entropy_secret_123456",
        database_url="postgresql://user:pass@ep-host.neon.tech/db?sslmode=require",
        email_mode="console",
        public_url="https://api.kavach.ai",
        public_site_url="https://kavach.ai",
        admin_origin="https://admin.kavach.ai",
        mock_stt=True,
        admin_enabled=True,
        admin_allowed_emails=("ops@kavach.ai",),
    )
    validate_config(s)

