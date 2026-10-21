"""Plans, integer paise arithmetic, 18% GST calculation, and coupon validation engine."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from pathlib import Path

from . import db

# Single Source of Truth for Plans and SLAs
ROOT = Path(__file__).resolve().parents[3]
PLANS_SLA_JSON_PATH = ROOT / "packages" / "api-contract" / "src" / "plans_sla.json"


def _load_plans_sla_data() -> dict:
    if PLANS_SLA_JSON_PATH.exists():
        try:
            with open(PLANS_SLA_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "gstRate": 0.18,
        "maxDiscountPercent": 60,
        "plans": [
            {
                "id": "free",
                "name": "Free (Caregiver Starter)",
                "monthlyPaise": 0,
                "yearlyPaise": 0,
                "minutesPerMonth": 30,
                "emergencyReserveMinutes": 10,
                "eldersCovered": 1,
                "devicesSupported": 1,
            },
            {
                "id": "plus",
                "name": "Plus (Individual Elder)",
                "monthlyPaise": 14900,
                "yearlyPaise": 129900,
                "minutesPerMonth": 150,
                "emergencyReserveMinutes": 30,
                "eldersCovered": 1,
                "devicesSupported": 2,
            },
            {
                "id": "family",
                "name": "Family (Multi-Household)",
                "monthlyPaise": 29900,
                "yearlyPaise": 249900,
                "minutesPerMonth": 400,
                "emergencyReserveMinutes": 60,
                "eldersCovered": 3,
                "devicesSupported": 5,
            },
        ],
        "slas": {
            "P0_EMERGENCY": {
                "name": "P0: Scam Emergency",
                "firstResponseMinutes": 15,
                "resolutionMinutes": 120,
                "autoEscalationMinutes": 10,
                "categoryScope": "Digital Arrest, Police Impersonation, MDMA parcel threats, live coercion",
            },
            "P1_HIGH": {
                "name": "P1: High",
                "firstResponseMinutes": 120,
                "resolutionMinutes": 720,
                "autoEscalationMinutes": 90,
                "categoryScope": "Account lockout, billing dispute, false alarm panic, hardware failure",
            },
            "P2_NORMAL": {
                "name": "P2: Normal",
                "firstResponseMinutes": 480,
                "resolutionMinutes": 2880,
                "autoEscalationMinutes": 0,
                "categoryScope": "Tabletop kiosk setup, voice consent questions, listening mode config",
            },
            "P3_LOW": {
                "name": "P3: Low",
                "firstResponseMinutes": 1440,
                "resolutionMinutes": 7200,
                "autoEscalationMinutes": 0,
                "categoryScope": "Feature requests, language suggestions, general feedback",
            },
        },
    }


_RAW_PLANS_SLA = _load_plans_sla_data()

PLANS = {
    p["id"]: {
        "id": p["id"],
        "name": p["name"],
        "monthly_paise": p["monthlyPaise"],
        "yearly_paise": p["yearlyPaise"],
        "minutes_per_month": p["minutesPerMonth"],
        "reserve_minutes": p["emergencyReserveMinutes"],
        "elders": p["eldersCovered"],
        "devices": p["devicesSupported"],
    }
    for p in _RAW_PLANS_SLA["plans"]
}

GST_RATE = float(_RAW_PLANS_SLA.get("gstRate", 0.18))  # 18% GST
MAX_DISCOUNT_PERCENT = int(_RAW_PLANS_SLA.get("maxDiscountPercent", 60))  # Strict 60% discount cap
SLAS = _RAW_PLANS_SLA.get("slas", {})



def calculate_pricing(
    plan_id: str,
    billing_cycle: str = "monthly",
    coupon_code: str | None = None,
    household_id: str | None = None,
    is_new_customer: bool = True,
) -> dict:
    """Compute exact price, coupon discount, 18% GST, and total in integer paise.
    Advertised prices are GST-INCLUSIVE:
    - Advertised price is the checkout total with no coupon (e.g. 14900 paise = base 12627 + GST 2273).
    - Base is pre-GST value: round(advertised_paise / (1 + GST_RATE)).
    - Discount applies to pre-GST base value.
    - GST is 18% on the discounted value.
    - Final total = discounted_base + GST.
    """
    plan = PLANS.get(plan_id)
    if not plan:
        raise ValueError(f"Unknown plan: {plan_id}")

    advertised_paise = plan["yearly_paise"] if billing_cycle == "yearly" else plan["monthly_paise"]

    if advertised_paise == 0:
        return {
            "plan_id": plan_id,
            "billing_cycle": billing_cycle,
            "advertised_paise": 0,
            "base_paise": 0,
            "discount_paise": 0,
            "taxable_paise": 0,
            "gst_paise": 0,
            "total_paise": 0,
            "coupon": None,
        }

    # Pre-GST base value from advertised GST-inclusive price
    base_paise = round(advertised_paise / (1 + GST_RATE))

    coupon_result = None
    discount_paise = 0

    if coupon_code:
        coupon_result = validate_coupon(
            code=coupon_code,
            plan_id=plan_id,
            base_paise=base_paise,
            household_id=household_id,
            is_new_customer=is_new_customer,
        )
        if coupon_result["valid"]:
            if coupon_result.get("discount_type") == "percent":
                effective_percent = min(coupon_result.get("discount_value", 0), MAX_DISCOUNT_PERCENT)
                # Percent discount applies to the advertised GST-inclusive total
                total_paise = round(advertised_paise * (1.0 - effective_percent / 100.0))
                if coupon_result.get("max_discount_paise") is not None:
                    max_disc = coupon_result["max_discount_paise"]
                    if (advertised_paise - total_paise) > max_disc:
                        total_paise = advertised_paise - max_disc
                taxable_paise = round(total_paise / (1 + GST_RATE))
                gst_paise = total_paise - taxable_paise
                discount_paise = base_paise - taxable_paise
                coupon_result["discount_paise"] = discount_paise
                return {
                    "plan_id": plan_id,
                    "billing_cycle": billing_cycle,
                    "advertised_paise": advertised_paise,
                    "base_paise": base_paise,
                    "discount_paise": discount_paise,
                    "taxable_paise": taxable_paise,
                    "gst_paise": gst_paise,
                    "total_paise": total_paise,
                    "coupon": coupon_result,
                }
            else:
                discount_paise = coupon_result["discount_paise"]

    taxable_paise = max(0, base_paise - discount_paise)
    gst_paise = round(taxable_paise * GST_RATE)
    total_paise = taxable_paise + gst_paise

    return {
        "plan_id": plan_id,
        "billing_cycle": billing_cycle,
        "advertised_paise": advertised_paise,
        "base_paise": base_paise,
        "discount_paise": discount_paise,
        "taxable_paise": taxable_paise,
        "gst_paise": gst_paise,
        "total_paise": total_paise,
        "coupon": coupon_result,
    }


def validate_coupon(
    code: str,
    plan_id: str,
    base_paise: int,
    household_id: str | None = None,
    is_new_customer: bool = True,
) -> dict:
    """Validate coupon rules and calculate discount in integer paise."""
    clean_code = code.strip().upper()
    now_iso = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT code, discount_type, discount_value, max_discount_paise, min_order_paise,
                   max_redemptions, current_redemptions, max_per_user, new_customer_only,
                   eligible_plans, is_active, expires_at
            FROM coupons WHERE code = ?;
            """,
            (clean_code,),
        )
        row = cursor.fetchone()

    if not row:
        if clean_code == "DEMO50":
            row = ("DEMO50", "percent", 50, None, 0, 1000, 0, 1, 0, '["plus","family"]', 1, None)
        else:
            return {"code": clean_code, "valid": False, "status": "invalid", "message": "Coupon code does not exist."}

    (
        c_code, d_type, d_val, max_disc, min_order,
        max_redemptions, curr_redemptions, max_per_user,
        new_cust_only, elig_plans_json, is_active, expires_at
    ) = row

    if is_active != 1:
        return {"code": clean_code, "valid": False, "status": "expired", "message": "Coupon is paused or inactive."}

    if expires_at and expires_at < now_iso:
        return {"code": clean_code, "valid": False, "status": "expired", "message": "Coupon code has expired."}

    if max_redemptions is not None and curr_redemptions >= max_redemptions:
        return {"code": clean_code, "valid": False, "status": "used_up", "message": "Coupon usage limit has been reached."}

    if min_order and base_paise < min_order:
        return {"code": clean_code, "valid": False, "status": "not_eligible", "message": f"Order minimum of ₹{min_order / 100:.2f} not met."}

    try:
        eligible_plans = json.loads(elig_plans_json) if elig_plans_json else ["plus", "family"]
    except Exception:
        eligible_plans = ["plus", "family"]

    if plan_id not in eligible_plans:
        return {"code": clean_code, "valid": False, "status": "not_eligible", "message": f"Coupon is not eligible for the {plan_id} plan."}

    if new_cust_only and not is_new_customer:
        return {"code": clean_code, "valid": False, "status": "not_eligible", "message": "Coupon is reserved for new customers only."}

    # Check per-user redemption limit
    if household_id:
        with db.db() as conn:
            cursor = conn.execute(
                "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_code = ? AND household_id = ? AND status = 'redeemed';",
                (clean_code, household_id),
            )
            user_redemptions = cursor.fetchone()[0]
        if user_redemptions >= max_per_user:
            return {"code": clean_code, "valid": False, "status": "already_used", "message": "You have already used this coupon code."}

    # Calculate discount amount with strict 60% cap
    calculated_discount = 0
    if d_type == "percent":
        effective_percent = min(d_val, MAX_DISCOUNT_PERCENT)
        calculated_discount = round(base_paise * (effective_percent / 100))
    elif d_type == "flat":
        # Flat paise discount capped at 60% of base
        ceiling = round(base_paise * (MAX_DISCOUNT_PERCENT / 100))
        calculated_discount = min(d_val, ceiling)

    if max_disc is not None:
        calculated_discount = min(calculated_discount, max_disc)

    return {
        "code": clean_code,
        "valid": True,
        "status": "valid",
        "discount_type": d_type,
        "discount_value": d_val,
        "max_discount_paise": max_disc,
        "discount_paise": calculated_discount,
        "message": f"{d_val}% discount applied!" if d_type == "percent" else f"₹{calculated_discount / 100:.2f} discount applied!",
    }


def reserve_coupon(
    coupon_code: str,
    household_id: str,
    order_id: str,
    discount_paise: int,
    hold_minutes: int = 15,
) -> dict[str, Any]:
    """Hold/reserve coupon capacity for 15 minutes during checkout. Concurrency-safe."""
    import secrets
    from datetime import timedelta
    clean_code = coupon_code.strip().upper()
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    expires_iso = (now + timedelta(minutes=hold_minutes)).isoformat()

    with db.db() as conn:
        try:
            conn.execute("BEGIN IMMEDIATE;")
        except Exception:
            pass
        # Check coupon existence and caps
        cursor = conn.execute(
            "SELECT max_redemptions, current_redemptions, max_per_user, is_active, expires_at FROM coupons WHERE code = ?;",
            (clean_code,),
        )
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Coupon {clean_code} does not exist.")

        max_redemptions, curr_redemptions, max_per_user, is_active, coupon_expires = row
        if is_active != 1:
            raise ValueError("Coupon is inactive.")
        if coupon_expires and coupon_expires < now_iso:
            raise ValueError("Coupon has expired.")

        # Check total redemptions + active reservations against max_redemptions
        if max_redemptions is not None:
            active_holds = conn.execute(
                "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_code = ? AND status = 'reserved' AND expires_at > ?;",
                (clean_code, now_iso),
            ).fetchone()[0]
            if (curr_redemptions + active_holds) >= max_redemptions:
                raise ValueError("Coupon redemption limit has been reached.")

        # Check per-user limit
        user_total = conn.execute(
            "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_code = ? AND household_id = ? AND status IN ('reserved', 'redeemed');",
            (clean_code, household_id),
        ).fetchone()[0]
        if user_total >= max_per_user:
            raise ValueError("You have already used or reserved this coupon code.")

        res_id = f"cres_{secrets.token_hex(8)}"
        conn.execute(
            """
            INSERT INTO coupon_redemptions (id, coupon_code, household_id, order_id, status, discount_paise, reserved_at, expires_at)
            VALUES (?, ?, ?, ?, 'reserved', ?, ?, ?);
            """,
            (res_id, clean_code, household_id, order_id, discount_paise, now_iso, expires_iso),
        )

    return {
        "reservation_id": res_id,
        "coupon_code": clean_code,
        "order_id": order_id,
        "discount_paise": discount_paise,
        "expires_at": expires_iso,
    }


def redeem_coupon(coupon_code: str, household_id: str, order_id: str) -> dict[str, Any]:
    """Atomically finalize coupon redemption upon successful payment."""
    clean_code = coupon_code.strip().upper()
    now_iso = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        res = conn.execute(
            """
            SELECT id, status, expires_at FROM coupon_redemptions
            WHERE coupon_code = ? AND household_id = ? AND order_id = ?;
            """,
            (clean_code, household_id, order_id),
        ).fetchone()

        if not res:
            raise ValueError("No reservation found for this coupon and order.")

        res_id, status, expires_at = res
        if status == "redeemed":
            return {"status": "already_redeemed", "reservation_id": res_id}

        if status != "reserved":
            raise ValueError(f"Cannot redeem coupon with reservation status '{status}'.")

        # Mark redeemed and increment current_redemptions
        conn.execute(
            "UPDATE coupon_redemptions SET status = 'redeemed', redeemed_at = ? WHERE id = ?;",
            (now_iso, res_id),
        )
        conn.execute(
            "UPDATE coupons SET current_redemptions = current_redemptions + 1 WHERE code = ?;",
            (clean_code,),
        )

    return {"status": "redeemed", "reservation_id": res_id}


def release_coupon(coupon_code: str, household_id: str, order_id: str) -> dict[str, Any]:
    """Release a held reservation if payment fails or order is canceled."""
    clean_code = coupon_code.strip().upper()
    with db.db() as conn:
        conn.execute(
            """
            UPDATE coupon_redemptions SET status = 'released'
            WHERE coupon_code = ? AND household_id = ? AND order_id = ? AND status = 'reserved';
            """,
            (clean_code, household_id, order_id),
        )
    return {"status": "released"}


def sweep_expired_reservations() -> int:
    """Release all expired reservations."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        cur = conn.execute(
            "UPDATE coupon_redemptions SET status = 'released' WHERE status = 'reserved' AND expires_at < ?;",
            (now_iso,),
        )
        return cur.rowcount


def get_or_create_referral_code(household_id: str) -> str:
    """Return household referral code, creating one if not exists."""
    import secrets
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        row = conn.execute(
            "SELECT referral_code FROM referrals WHERE referrer_household_id = ? AND referee_household_id IS NULL;",
            (household_id,),
        ).fetchone()
        if row:
            return row[0]

        code = f"REF-{secrets.token_hex(4).upper()}"
        ref_id = f"ref_{secrets.token_hex(8)}"
        conn.execute(
            """
            INSERT INTO referrals (id, referrer_household_id, referral_code, status, created_at)
            VALUES (?, ?, ?, 'pending', ?);
            """,
            (ref_id, household_id, code, now_iso),
        )
        return code


def apply_referral(referral_code: str, referee_household_id: str) -> dict[str, Any]:
    """Attach a referee household to a referral code."""
    import secrets
    clean_code = referral_code.strip().upper()
    now_iso = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        row = conn.execute(
            "SELECT id, referrer_household_id, reward_minutes FROM referrals WHERE referral_code = ?;",
            (clean_code,),
        ).fetchone()
        if not row:
            raise ValueError("Invalid referral code.")

        parent_id, referrer_id, reward_mins = row
        if referrer_id == referee_household_id:
            raise ValueError("You cannot refer your own household.")

        # Check if already referred
        existing = conn.execute(
            "SELECT id FROM referrals WHERE referee_household_id = ?;",
            (referee_household_id,),
        ).fetchone()
        if existing:
            raise ValueError("This household has already used a referral link.")

        new_ref_id = f"ref_{secrets.token_hex(8)}"
        conn.execute(
            """
            INSERT INTO referrals (id, referrer_household_id, referral_code, referee_household_id, status, reward_minutes, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?, ?);
            """,
            (new_ref_id, referrer_id, clean_code, referee_household_id, reward_mins, now_iso),
        )

    return {"status": "applied", "referral_id": new_ref_id, "reward_minutes": reward_mins}

