"""Security route sweep across all registered /admin-api endpoints asserting strict isolation."""
from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.routes_admin import admin_router
from app import admin_auth, admin_cli, db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_sweep_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_sweep.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai")
    db.init_db()
    admin_cli.bootstrap_totp("owner@kavach.ai")
    yield


def test_anonymous_route_sweep_denial():
    """Assert that EVERY /admin-api endpoint (except public auth intake) strictly denies anonymous access."""
    public_auth_paths = {
        "/admin-api/auth/magic-link",
        "/admin-api/auth/verify-magic-link",
        "/admin-api/auth/verify-totp",
    }

    admin_routes = []
    for route in admin_router.routes:
        path = getattr(route, "path", "")
        if path.startswith("/admin-api") and path not in public_auth_paths:
            methods = getattr(route, "methods", {"GET"})
            for method in methods:
                if method not in ("HEAD", "OPTIONS"):
                    admin_routes.append((method, path))

    assert len(admin_routes) >= 5, f"Expected multiple admin routes, found: {admin_routes}"


    for method, path in admin_routes:
        # Send request without session cookie
        res = client.request(method, path)
        assert res.status_code in (401, 403), (
            f"Expected 401 or 403 for anonymous request to {method} {path}, got {res.status_code}"
        )


def test_wrong_origin_cors_rejection():
    """Verify that requests from an unauthorized Origin are rejected with 403."""
    res = client.post(
        "/admin-api/auth/magic-link",
        headers={"Origin": "https://malicious-scam-site.com"},
        json={"email": "owner@kavach.ai"},
    )
    assert res.status_code == 403
    assert "Cross-origin admin requests rejected" in res.text


def test_admin_disabled_mode_returns_404(monkeypatch):
    """When ADMIN_ENABLED=0, all /admin-api endpoints must cleanly return 404."""
    monkeypatch.setenv("ADMIN_ENABLED", "0")
    # Anonymous request to magic link
    res = client.post("/admin-api/auth/magic-link", json={"email": "owner@kavach.ai"})
    assert res.status_code == 404
