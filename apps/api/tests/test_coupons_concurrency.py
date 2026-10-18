"""Unit and concurrency tests for Coupons engine, 18% GST math, Holds, Referrals, and Payments."""
import concurrent.futures
import json
import secrets
from datetime import datetime, timedelta, timezone

import pyotp
import pytest
from fastapi.testclient import TestClient

from app import admin_auth, admin_cli, db
from app.main import app
from app.payments import FakePaymentProvider
from app.plans_config import (
    GST_RATE,
    MAX_DISCOUNT_PERCENT,
    PLANS,
    calculate_pricing,
    sweep_expired_reservations,
)
from app.signed_token import create_action_token


@pytest.fixture(autouse=True)
def setup_coupons_env(tmp_path, monkeypatch):
    test_db = tmp_path / "test_coupons.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    monkeypatch.setenv("ADMIN_ENABLED", "1")
    monkeypatch.setenv("ADMIN_ALLOWED_EMAILS", "owner@kavach.ai")
    monkeypatch.setenv("EMAIL_MODE", "console")
    db.init_db()
    admin_cli.bootstrap_totp("owner@kavach.ai")
    yield


def _login_owner(client: TestClient) -> tuple[dict, str, pyotp.TOTP]:
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
    return cookies, csrf_token, totp


def test_integer_paise_and_gst_math():
    """Verify exact integer paise math, 18% GST calculation, and 60% discount ceiling."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO coupons (code, discount_type, discount_value, min_order_paise, max_per_user, is_active, created_by, created_at)
            VALUES ('TEST20', 'percent', 20, 0, 1, 1, 'owner@kavach.ai', ?);
            """,
            (now_iso,),
        )

    res = calculate_pricing("plus", "monthly", coupon_code="TEST20")
    assert res["base_paise"] == 14900
    assert res["discount_paise"] == round(14900 * 0.20)  # 2980 paise
    assert res["taxable_paise"] == 14900 - 2980          # 11920 paise
    assert res["gst_paise"] == round(11920 * 0.18)       # 2146 paise
    assert res["total_paise"] == 11920 + 2146            # 14066 paise

    # Cap test: 90% coupon must be capped at 60%
    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO coupons (code, discount_type, discount_value, min_order_paise, max_per_user, is_active, created_by, created_at)
            VALUES ('GREEDY90', 'percent', 90, 0, 1, 1, 'owner@kavach.ai', ?);
            """,
            (now_iso,),
        )
    cap_res = calculate_pricing("plus", "monthly", coupon_code="GREEDY90")
    assert cap_res["discount_paise"] == round(14900 * 0.60)
    assert cap_res["taxable_paise"] == 14900 - 8940


def test_public_coupon_validate_api():
    """Test public /api/coupons/validate states."""
    client = TestClient(app)
    now_iso = datetime.now(timezone.utc).isoformat()
    past_iso = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO coupons (code, discount_type, discount_value, min_order_paise, max_redemptions, current_redemptions, is_active, expires_at, created_by, created_at)
            VALUES 
                ('VALID50', 'flat', 5000, 0, 10, 0, 1, NULL, 'owner@kavach.ai', ?),
                ('EXPIRED10', 'percent', 10, 0, 10, 0, 1, ?, 'owner@kavach.ai', ?),
                ('USEDUP', 'percent', 15, 0, 1, 1, 1, NULL, 'owner@kavach.ai', ?);
            """,
            (now_iso, past_iso, now_iso, now_iso),
        )

    # Valid coupon
    r_valid = client.post("/api/coupons/validate", json={"code": "VALID50", "plan_id": "plus"})
    assert r_valid.status_code == 200
    assert r_valid.json()["valid"] is True
    assert r_valid.json()["discount_paise"] == 5000

    # Expired coupon
    r_exp = client.post("/api/coupons/validate", json={"code": "EXPIRED10", "plan_id": "plus"})
    assert r_exp.status_code == 200
    assert r_exp.json()["valid"] is False
    assert r_exp.json()["status"] == "expired"

    # Used up coupon
    r_used = client.post("/api/coupons/validate", json={"code": "USEDUP", "plan_id": "plus"})
    assert r_used.status_code == 200
    assert r_used.json()["valid"] is False
    assert r_used.json()["status"] == "used_up"


def test_coupon_concurrency_and_race_prevention():
    """Prove that parallel reservation requests never over-redeem a coupon with limited capacity."""
    client = TestClient(app)
    now_iso = datetime.now(timezone.utc).isoformat()
    coupon_code = "LIMITED2"

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO coupons (code, discount_type, discount_value, max_redemptions, current_redemptions, max_per_user, is_active, created_by, created_at)
            VALUES (?, 'percent', 25, 2, 0, 1, 1, 'owner@kavach.ai', ?);
            """,
            (coupon_code, now_iso),
        )

    def attempt_order(idx: int):
        hh_id = f"hh_conc_{idx}_{secrets.token_hex(4)}"
        t_client = TestClient(app)
        return t_client.post(
            "/api/orders/create",
            json={
                "household_id": hh_id,
                "plan_id": "plus",
                "billing_cycle": "monthly",
                "coupon_code": coupon_code,
            },
        )

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(attempt_order, i) for i in range(10)]
        results = [f.result() for f in futures]

    statuses = [r.status_code for r in results]
    success_count = statuses.count(200)
    conflict_count = statuses.count(409)

    assert success_count == 2
    assert conflict_count == 8

    with db.db() as conn:
        holds = conn.execute(
            "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_code = ? AND status = 'reserved';",
            (coupon_code,),
        ).fetchone()[0]
    assert holds == 2


def test_payment_webhook_and_entitlements_lifecycle():
    """Verify complete order -> reservation -> fake payment webhook -> coupon redemption -> subscription activation."""
    client = TestClient(app)
    now_iso = datetime.now(timezone.utc).isoformat()
    hh_id = f"hh_flow_{secrets.token_hex(4)}"

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO coupons (code, discount_type, discount_value, max_redemptions, current_redemptions, max_per_user, is_active, created_by, created_at)
            VALUES ('FLOW30', 'percent', 30, 5, 0, 1, 1, 'owner@kavach.ai', ?);
            """,
            (now_iso,),
        )

    r_order = client.post(
        "/api/orders/create",
        json={"household_id": hh_id, "plan_id": "family", "billing_cycle": "monthly", "coupon_code": "FLOW30"},
    )
    assert r_order.status_code == 200
    order_data = r_order.json()
    order_id = order_data["order_id"]
    total_paise = order_data["pricing"]["total_paise"]

    with db.db() as conn:
        hold_row = conn.execute(
            "SELECT status FROM coupon_redemptions WHERE order_id = ?;",
            (order_id,),
        ).fetchone()
        assert hold_row[0] == "reserved"

    fake_provider = FakePaymentProvider()
    sim = fake_provider.simulate_payment_success(order_id=order_id, household_id=hh_id, amount_paise=total_paise)

    r_wh = client.post(
        "/api/webhooks/payment/fake",
        content=sim["body"],
        headers={"X-Signature": sim["signature"]},
    )
    assert r_wh.status_code == 200
    assert r_wh.json()["status"] == "ok"

    with db.db() as conn:
        ord_status = conn.execute("SELECT status FROM orders WHERE id = ?;", (order_id,)).fetchone()[0]
        assert ord_status == "paid"

        c_status = conn.execute("SELECT status FROM coupon_redemptions WHERE order_id = ?;", (order_id,)).fetchone()[0]
        assert c_status == "redeemed"

        coupon_uses = conn.execute("SELECT current_redemptions FROM coupons WHERE code = 'FLOW30';").fetchone()[0]
        assert coupon_uses == 1

        sub = conn.execute("SELECT plan_id, status FROM subscriptions WHERE household_id = ?;", (hh_id,)).fetchone()
        assert sub is not None
        assert sub[0] == "family"
        assert sub[1] == "active"


def test_referrals_engine():
    """Verify household referral link generation, self-referral block, and bonus minute credit."""
    client = TestClient(app)
    hh_referrer = f"hh_ref_{secrets.token_hex(4)}"
    hh_referee = f"hh_ree_{secrets.token_hex(4)}"

    r_code = client.get(f"/api/referrals/{hh_referrer}")
    assert r_code.status_code == 200
    ref_code = r_code.json()["referral_code"]
    assert ref_code.startswith("REF-")

    r_self = client.post("/api/referrals/apply", json={"referral_code": ref_code, "referee_household_id": hh_referrer})
    assert r_self.status_code == 400
    assert "cannot refer your own" in r_self.json()["detail"]

    r_apply = client.post("/api/referrals/apply", json={"referral_code": ref_code, "referee_household_id": hh_referee})
    assert r_apply.status_code == 200
    assert r_apply.json()["status"] == "applied"

    r_dup = client.post("/api/referrals/apply", json={"referral_code": ref_code, "referee_household_id": hh_referee})
    assert r_dup.status_code == 400
    assert "already used a referral" in r_dup.json()["detail"]

    r_order = client.post("/api/orders/create", json={"household_id": hh_referee, "plan_id": "plus"})
    order_id = r_order.json()["order_id"]
    fake_provider = FakePaymentProvider()
    sim = fake_provider.simulate_payment_success(order_id=order_id, household_id=hh_referee, amount_paise=14900)
    client.post("/api/webhooks/payment/fake", content=sim["body"], headers={"X-Signature": sim["signature"]})

    with db.db() as conn:
        ref_ledger = conn.execute("SELECT amount_minutes FROM credit_ledger WHERE household_id = ?;", (hh_referrer,)).fetchone()
        ree_ledger = conn.execute("SELECT amount_minutes FROM credit_ledger WHERE household_id = ?;", (hh_referee,)).fetchone()
        assert ref_ledger[0] == 30
        assert ree_ledger[0] == 30


def test_admin_coupons_management_and_step_up():
    """Verify admin coupon creation, step-up check for discounts >60%, bulk creation, and simulation."""
    client = TestClient(app)
    cookies, csrf_token, totp = _login_owner(client)
    for k, v in cookies.items():
        client.cookies.set(k, v)

    headers = {
        "Origin": "http://localhost:3002",
        "Host": "localhost:8000",
        "X-CSRF-Token": csrf_token,
    }

    # 1. Creation with discount > 60% without step-up must fail with 403 step_up_required
    r_greedy = client.post(
        "/admin-api/coupons",
        json={"code": "BIG70", "discount_type": "percent", "discount_value": 70},
        headers=headers,
    )
    assert r_greedy.status_code == 403
    assert r_greedy.json()["detail"]["error"] == "step_up_required"

    # 2. Perform step-up TOTP verification
    r_stepup = client.post(
        "/admin-api/auth/step-up",
        headers=headers,
        json={"totp_code": totp.now()},
    )
    assert r_stepup.status_code == 200

    # 3. Now creation with discount > 60% succeeds
    r_success = client.post(
        "/admin-api/coupons",
        json={"code": "BIG70", "discount_type": "percent", "discount_value": 70},
        headers=headers,
    )
    assert r_success.status_code == 200
    assert r_success.json()["status"] == "created"

    # 4. Bulk generate coupons
    r_bulk = client.post(
        "/admin-api/coupons/bulk",
        json={"prefix": "PARTNER", "count": 5, "discount_type": "percent", "discount_value": 20, "partner_id": "hdfc"},
        headers=headers,
    )
    assert r_bulk.status_code == 200
    assert r_bulk.json()["count"] == 5

    # 5. Simulate coupon
    r_sim = client.post(
        "/admin-api/coupons/simulate",
        json={"code": "BIG70", "plan_id": "plus", "billing_cycle": "monthly"},
        headers=headers,
    )
    assert r_sim.status_code == 200
    assert r_sim.json()["discount_paise"] > 0
