"""Regression tests for defects D-001 through D-009 and rebranding functionality."""
import os
from pathlib import Path
from fastapi.testclient import TestClient

from app.config import ROOT, get_settings
from app.main import app
from scripts.seed_demo_data import seed_demo_data


def test_d001_seeder_clean_deletes_without_column_error():
    """D-001: seed_demo_data(clean=True) must run cleanly without OperationalError on tickets table."""
    seed_demo_data(clean=True)


def test_d002_judge_panel_mobile_responsive_css():
    """D-002: apps/web/index.html must have overflow protection and 480px responsive rules."""
    html_path = ROOT / "apps" / "web" / "index.html"
    assert html_path.exists()
    content = html_path.read_text(encoding="utf-8")
    assert "box-sizing: border-box;" in content
    assert "overflow-x: hidden;" in content
    assert "@media (max-width: 480px)" in content


def test_d003_load_elders_mock_guard():
    """D-003: apps/web/app.js loadElders() must not trigger unauthenticated fetch on startup."""
    app_js = ROOT / "apps" / "web" / "app.js"
    assert app_js.exists()
    content = app_js.read_text(encoding="utf-8")
    assert "if (!token) {" in content
    assert "demo_elder_1" in content


def test_d004_favicons_exist_across_all_apps():
    """D-004: Valid favicon.ico must exist across site, app, admin, and web apps."""
    destinations = [
        ROOT / "apps" / "site" / "public" / "favicon.ico",
        ROOT / "apps" / "app" / "public" / "favicon.ico",
        ROOT / "apps" / "admin" / "public" / "favicon.ico",
        ROOT / "apps" / "web" / "favicon.ico",
    ]
    for p in destinations:
        assert p.exists(), f"Favicon missing at {p}"
        assert p.stat().st_size > 100, f"Favicon empty at {p}"


def test_d005_footer_repo_link_and_config():
    """D-005: GitHub repo URL must be configurable via config and /api/config."""
    with TestClient(app) as c:
        cfg = c.get("/api/config").json()
        assert "github_repo_url" in cfg
        assert "pritpatel2412/Kavach" in cfg["github_repo_url"]


def test_d006_how_it_works_anchor_present_on_landing():
    """D-006: Landing page must provide id='how-it-works' anchor target."""
    page_path = ROOT / "apps" / "site" / "src" / "app" / "page.tsx"
    assert page_path.exists()
    content = page_path.read_text(encoding="utf-8")
    assert 'id="how-it-works"' in content


def test_d007_support_portal_url_uses_public_site_url():
    """D-007: Support ticket creation must generate portal_url pointing to public site."""
    s = get_settings()
    with TestClient(app) as c:
        res = c.post(
            "/api/support",
            json={
                "name": "Regression Tester",
                "email": "d007@example.com",
                "category": "feedback",
                "subject": "D007 Verification",
                "message": "Verify portal URL format",
            },
        )
        assert res.status_code == 200
        portal_url = res.json()["portal_url"]
        assert portal_url.startswith(f"{s.public_site_url}/support/t/")


def test_d008_form_inputs_have_aria_labels():
    """D-008: Pricing inputs and SiteHeader search must have accessible aria-labels."""
    pricing_page = ROOT / "apps" / "site" / "src" / "app" / "pricing" / "page.tsx"
    header_comp = ROOT / "apps" / "site" / "src" / "components" / "SiteHeader.tsx"
    
    p_content = pricing_page.read_text(encoding="utf-8")
    assert 'aria-label="Coupon Code"' in p_content
    assert 'aria-label="Bot Check"' in p_content

    h_content = header_comp.read_text(encoding="utf-8")
    assert 'aria-label="Search scams, numbers, and advisories"' in h_content


def test_d009_opengraph_and_twitter_meta_tags():
    """D-009: Layouts must export openGraph and twitter metadata."""
    layouts = [
        ROOT / "apps" / "site" / "src" / "app" / "layout.tsx",
        ROOT / "apps" / "app" / "src" / "app" / "layout.tsx",
        ROOT / "apps" / "admin" / "src" / "app" / "layout.tsx",
    ]
    for lay in layouts:
        assert lay.exists()
        txt = lay.read_text(encoding="utf-8")
        assert "openGraph:" in txt, f"Missing openGraph in {lay}"
        assert "twitter:" in txt, f"Missing twitter in {lay}"


def test_rebrand_script_execution():
    """X6 Rebranding: scripts/rebrand.py must update environment variables without errors."""
    import subprocess
    import sys
    cmd = [
        sys.executable,
        str(ROOT / "scripts" / "rebrand.py"),
        "--name", "Kavach",
        "--domain", "kavach.ai",
        "--repo-url", "https://github.com/pritpatel2412/Kavach",
        "--ticket-prefix", "KAV",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT))
    assert res.returncode == 0, f"Rebrand script failed: {res.stderr}"
    assert "Rebranding complete" in res.stdout
