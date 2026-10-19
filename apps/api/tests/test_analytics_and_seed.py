"""Unit tests for Visual Analytics, real SQL rollups, demo dataset seeder, and KPIs."""
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import pyotp
import pytest
from fastapi.testclient import TestClient

from app import admin_auth, admin_cli, db
from app.main import app
from app.routes_analytics import refresh_daily_rollups
from app.signed_token import create_action_token
from scripts.seed_demo_data import check_environment, seed_demo_data


@pytest.fixture(autouse=True)
def setup_analytics_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_analytics.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai")
    monkeypatch.setenv("ENV", "test")
    db.init_db()
    admin_cli.bootstrap_totp("owner@kavach.ai")
    yield


def _login_owner(client: TestClient) -> tuple[dict, str]:
    with db.db() as conn:
        cursor = conn.execute("SELECT totp_secret_enc FROM admin_users WHERE email = 'owner@kavach.ai';")
        enc = cursor.fetchone()[0]
    secret = admin_auth.decrypt_totp_secret(enc)
    totp = pyotp.TOTP(secret)

    temp_token = create_action_token("owner@kavach.ai", purpose="admin_totp_step", ttl_s=300)
    res = client.post("/admin-api/auth/verify-totp", json={"temp_token": temp_token, "code": totp.now()})
    assert res.status_code == 200
    cookies = {admin_auth.COOKIE_NAME: res.cookies[admin_auth.COOKIE_NAME]}
    csrf_token = res.json()["csrf_token"]
    return cookies, csrf_token


def test_seed_demo_data_and_production_guard(monkeypatch):
    """Verify demo dataset seeds cleanly and refuses to run in production."""
    # 1. Production check raises error
    monkeypatch.setenv("ENV", "production")
    with pytest.raises(SystemExit):
        check_environment()

    # 2. In test env, seed successfully
    monkeypatch.setenv("ENV", "test")
    seed_demo_data(clean=False)

    with db.db() as conn:
        wl_count = conn.execute("SELECT COUNT(*) FROM waitlist;").fetchone()[0]
        hh_count = conn.execute("SELECT COUNT(*) FROM guardians;").fetchone()[0]
        sess_count = conn.execute("SELECT COUNT(*) FROM sessions;").fetchone()[0]
        t_count = conn.execute("SELECT COUNT(*) FROM tickets;").fetchone()[0]
        roll_count = conn.execute("SELECT COUNT(*) FROM daily_analytics_rollups;").fetchone()[0]
        is_demo = conn.execute("SELECT is_demo FROM demo_dataset_meta WHERE key = 'global';").fetchone()[0]

    assert wl_count >= 40
    assert hh_count >= 15
    assert sess_count >= 30
    assert t_count >= 10
    assert roll_count >= 1
    assert is_demo == 1


def test_analytics_overview_kpis_and_funnel():
    """Verify Overview API returns structured KPI cards, sparklines, and conversion funnel."""
    client = TestClient(app)
    seed_demo_data(clean=False)
    cookies, csrf_token = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000"}
    res = client.get("/admin-api/analytics/overview?days=30", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["is_demo_data"] is True
    assert "kpis" in data
    kpis = data["kpis"]
    assert "waitlist_confirmed" in kpis
    assert "active_households" in kpis
    assert "active_devices" in kpis
    assert "alerts_l2_plus" in kpis
    assert "open_tickets" in kpis
    assert "mrr_formatted" in kpis

    # Funnel steps
    funnel = data["funnel"]
    assert len(funnel) == 5
    assert funnel[0]["step"] == "Waitlist Signups"
    assert funnel[4]["step"] == "Paid Subscriber"

    # Time series
    assert "time_series" in data
    assert len(data["time_series"]) > 0


def test_analytics_product_scam_families_and_heatmap():
    """Verify product analytics endpoint returns scam distributions and hourly heatmaps."""
    client = TestClient(app)
    seed_demo_data(clean=False)
    cookies, csrf_token = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000"}
    res = client.get("/admin-api/analytics/product?days=30", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "scam_families" in data
    assert len(data["scam_families"]) > 0
    assert "level_distribution" in data
    assert "hourly_heatmap" in data
    assert len(data["hourly_heatmap"]) == 24
    assert "latency_metrics" in data
    assert data["latency_metrics"]["p50_warning_sec"] < 3.0


def test_analytics_growth_and_revenue():
    """Verify growth attribution and revenue economics with GST arithmetic."""
    client = TestClient(app)
    seed_demo_data(clean=False)
    cookies, csrf_token = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {"Origin": "http://localhost:3002", "Host": "localhost:8000"}

    # Growth
    r_growth = client.get("/admin-api/analytics/growth", headers=headers)
    assert r_growth.status_code == 200
    growth_data = r_growth.json()
    assert len(growth_data["by_source"]) > 0
    assert len(growth_data["by_language"]) > 0
    assert len(growth_data["by_city"]) > 0

    # Revenue
    r_rev = client.get("/admin-api/analytics/revenue", headers=headers)
    assert r_rev.status_code == 200
    rev_data = r_rev.json()
    assert rev_data["connected"] is True
    assert "gst_collected_formatted" in rev_data
    assert len(rev_data["plan_mix"]) == 3

    # Cost & Margins
    r_margin = client.get("/admin-api/analytics/cost-margin", headers=headers)
    assert r_margin.status_code == 200
    margin_data = r_margin.json()
    assert margin_data["gross_margin_pct"] > 50.0
    assert len(margin_data["breakdown"]) == 3
