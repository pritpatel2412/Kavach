"""Unit tests for Neon Cloud diagnostics endpoint."""
from fastapi.testclient import TestClient

from app.main import app
from app import neon_service


def test_neon_status_endpoint_offline(monkeypatch):
    """Verifies /api/neon/status structure when unconfigured or offline."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("NEON_AUTH_JWKS_URL", raising=False)

    client = TestClient(app)
    response = client.get("/api/neon/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "services" in data
    assert "postgres" in data["services"]
    assert "auth" in data["services"]
    assert "ai_gateway" in data["services"]
    assert data["services"]["postgres"]["status"] == "not_configured"
    assert data["services"]["auth"]["status"] == "not_configured"


def test_neon_ai_gateway_free_tier():
    """Confirms AI gateway properly flags free-tier status."""
    res = neon_service.test_neon_ai_gateway_health()
    assert res["status"] in ("configured", "disabled_on_free_tier")
    assert "tier_notice" in res
    assert res["consent_gated"] is True
    assert res["transcripts_allowed"] is False


def test_api_neon_health_route_exposes_no_secrets(monkeypatch):
    """X7: /api/neon-health must return diagnostics and never expose secrets or raw passwords."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://kavach_admin:secret_password_12345@ep-cool-lake.ap-southeast-1.neon.tech/neondb?sslmode=require")
    client = TestClient(app)
    response = client.get("/api/neon-health")
    assert response.status_code == 200
    raw_text = response.text
    # Ensure sensitive credentials are never leaked
    assert "secret_password_12345" not in raw_text
    assert "kavach_secret" not in raw_text

    data = response.json()
    assert "services" in data
    assert "ai_gateway" in data["services"]
    assert data["services"]["ai_gateway"]["consent_gated"] is True
    assert data["services"]["ai_gateway"]["transcripts_allowed"] is False


def test_neon_postgres_migrations_offline(monkeypatch):
    """Verifies run_postgres_migrations gracefully skips when DATABASE_URL is missing."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("DATABASE_URL_UNPOOLED", raising=False)
    from app import migrations
    applied = migrations.run_postgres_migrations()
    assert applied == []


