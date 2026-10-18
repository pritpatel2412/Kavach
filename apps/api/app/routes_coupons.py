"""Coupons, Referrals, Checkout Orders, and Payment Webhooks router."""
from __future__ import annotations

import csv
import io
import json
import logging
import secrets
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from . import admin_auth, audit, db
from .payments import FakePaymentProvider, get_payment_provider, process_payment_success
from .plans_config import (
    MAX_DISCOUNT_PERCENT,
    PLANS,
    apply_referral,
    calculate_pricing,
    get_or_create_referral_code,
    redeem_coupon,
    release_coupon,
    reserve_coupon,
    sweep_expired_reservations,
    validate_coupon,
)
from .ratelimit import check_rate_limit

log = logging.getLogger("kavach.coupons")

# Public Router
public_coupons_router = APIRouter(tags=["coupons", "payments", "referrals"])

# Admin Router (enforces admin origin, noindex, Host check via dependency)
admin_coupons_router = APIRouter(
    prefix="/admin-api",
    tags=["admin-coupons"],
    dependencies=[Depends(admin_auth.check_admin_security)],
)


# --- Schemas ---

class CouponValidateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    plan_id: str = Field(..., pattern="^(plus|family)$")
    billing_cycle: str = Field("monthly", pattern="^(monthly|yearly)$")
    household_id: str | None = None


class OrderCreateRequest(BaseModel):
    household_id: str = Field(..., min_length=3)
    plan_id: str = Field(..., pattern="^(plus|family)$")
    billing_cycle: str = Field("monthly", pattern="^(monthly|yearly)$")
    coupon_code: str | None = None
    provider: str = Field("fake", pattern="^(fake|razorpay)$")


class ReferralApplyRequest(BaseModel):
    referral_code: str = Field(..., min_length=3, max_length=30)
    referee_household_id: str = Field(..., min_length=3)


class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    discount_type: str = Field(..., pattern="^(percent|flat|extra_period|bonus_minutes|trial_upgrade|partner)$")
    discount_value: int = Field(..., gt=0)
    max_discount_paise: int | None = None
    min_order_paise: int = 0
    max_redemptions: int | None = None
    max_per_user: int = 1
    new_customer_only: bool = False
    eligible_plans: list[str] = ["plus", "family"]
    expires_at: str | None = None


class BulkCouponCreateRequest(BaseModel):
    prefix: str = Field(..., min_length=2, max_length=10)
    count: int = Field(..., ge=1, le=500)
    discount_type: str = Field(..., pattern="^(percent|flat)$")
    discount_value: int = Field(..., gt=0)
    max_discount_paise: int | None = None
    min_order_paise: int = 0
    max_redemptions_per_coupon: int = 1
    eligible_plans: list[str] = ["plus", "family"]
    partner_id: str = Field("partner", min_length=2)
    expires_at: str | None = None


# --- Public Endpoints ---

@public_coupons_router.post("/api/coupons/validate")
async def public_validate_coupon(req: CouponValidateRequest, request: Request) -> dict[str, Any]:
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"coupon_val:{client_ip}", max_requests=40, window_s=60.0)

    # Sweep any stale expired holds
    sweep_expired_reservations()

    pricing = calculate_pricing(
        plan_id=req.plan_id,
        billing_cycle=req.billing_cycle,
        coupon_code=req.code,
        household_id=req.household_id,
    )
    coupon_info = pricing.get("coupon") or {}
    return {
        "valid": coupon_info.get("valid", False),
        "status": coupon_info.get("status", "invalid"),
        "code": coupon_info.get("code", req.code.strip().upper()),
        "discount_type": coupon_info.get("discount_type"),
        "discount_paise": pricing["discount_paise"],
        "base_paise": pricing["base_paise"],
        "taxable_paise": pricing["taxable_paise"],
        "gst_paise": pricing["gst_paise"],
        "total_paise": pricing["total_paise"],
        "message": coupon_info.get("message", "Invalid coupon."),
    }


@public_coupons_router.post("/api/orders/create")
async def create_checkout_order(req: OrderCreateRequest, request: Request) -> dict[str, Any]:
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"order_create:{client_ip}", max_requests=20, window_s=60.0)

    sweep_expired_reservations()

    # Calculate pricing and validate coupon
    pricing = calculate_pricing(
        plan_id=req.plan_id,
        billing_cycle=req.billing_cycle,
        coupon_code=req.coupon_code,
        household_id=req.household_id,
    )

    clean_coupon = None
    if req.coupon_code:
        coupon_res = pricing.get("coupon")
        if not coupon_res or not coupon_res.get("valid"):
            raise HTTPException(status_code=400, detail=coupon_res.get("message", "Invalid coupon code."))
        clean_coupon = coupon_res["code"]

    now_iso = datetime.now(timezone.utc).isoformat()
    order_id = f"ord_{secrets.token_hex(8)}"

    # Reserve coupon if applicable
    if clean_coupon:
        try:
            reserve_coupon(
                coupon_code=clean_coupon,
                household_id=req.household_id,
                order_id=order_id,
                discount_paise=pricing["discount_paise"],
                hold_minutes=15,
            )
        except ValueError as e:
            raise HTTPException(status_code=409, detail=str(e))

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO orders (id, household_id, plan_id, billing_cycle, base_paise, discount_paise, taxable_paise, gst_paise, total_paise, coupon_code, status, payment_provider, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created', ?, ?, ?);
            """,
            (
                order_id,
                req.household_id,
                req.plan_id,
                req.billing_cycle,
                pricing["base_paise"],
                pricing["discount_paise"],
                pricing["taxable_paise"],
                pricing["gst_paise"],
                pricing["total_paise"],
                clean_coupon,
                req.provider,
                now_iso,
                now_iso,
            ),
        )

    # Provider order creation
    provider = get_payment_provider(req.provider)
    provider_order = provider.create_order(
        household_id=req.household_id,
        amount_paise=pricing["total_paise"],
        plan_id=req.plan_id,
        billing_cycle=req.billing_cycle,
        notes={"order_id": order_id, "coupon_code": clean_coupon or ""},
    )

    return {
        "order_id": order_id,
        "household_id": req.household_id,
        "plan_id": req.plan_id,
        "billing_cycle": req.billing_cycle,
        "pricing": pricing,
        "provider_order": provider_order,
    }


@public_coupons_router.post("/api/webhooks/payment/{provider_name}")
async def handle_payment_webhook(
    provider_name: str,
    request: Request,
    x_razorpay_signature: str | None = Header(None),
    x_signature: str | None = Header(None),
) -> dict[str, Any]:
    raw_body = await request.body()
    signature = x_razorpay_signature or x_signature or ""

    provider = get_payment_provider(provider_name)
    try:
        payload = provider.verify_webhook(raw_body, signature)
    except Exception as e:
        log.warning("Webhook signature verification failed for %s: %s", provider_name, e)
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Extract payment data
    event_type = payload.get("event", "payment.captured")
    if event_type in ("payment.captured", "order.paid"):
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("notes", {}).get("order_id") or payment_entity.get("order_id")
        payment_id = payment_entity.get("id", f"pay_wh_{secrets.token_hex(6)}")
        amount_paise = payment_entity.get("amount", 0)

        if not order_id:
            # Look up order if order_id is provider order id
            with db.db() as conn:
                row = conn.execute("SELECT id FROM orders WHERE id = ?;", (payment_entity.get("order_id"),)).fetchone()
                if row:
                    order_id = row[0]

        if order_id:
            res = process_payment_success(
                order_id=order_id,
                payment_id=payment_id,
                amount_paise=amount_paise,
                provider=provider_name,
                raw_payload=payload,
            )
            return {"status": "ok", "result": res}

    return {"status": "ignored"}


@public_coupons_router.post("/api/referrals/apply")
async def public_apply_referral(req: ReferralApplyRequest) -> dict[str, Any]:
    try:
        res = apply_referral(referral_code=req.referral_code, referee_household_id=req.referee_household_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@public_coupons_router.get("/api/referrals/{household_id}")
async def get_household_referrals(household_id: str) -> dict[str, Any]:
    code = get_or_create_referral_code(household_id)
    with db.db() as conn:
        rows = conn.execute(
            "SELECT status, COUNT(*) FROM referrals WHERE referrer_household_id = ? AND referee_household_id IS NOT NULL GROUP BY status;",
            (household_id,),
        ).fetchall()
        counts = {r[0]: r[1] for r in rows}

        bonus_row = conn.execute(
            "SELECT COALESCE(SUM(amount_minutes), 0) FROM credit_ledger WHERE household_id = ? AND reason = 'referral_bonus';",
            (household_id,),
        ).fetchone()
        bonus_mins = bonus_row[0] if bonus_row else 0

    return {
        "referral_code": code,
        "referral_url": f"https://kavach.gnani.ai/join?ref={code}",
        "pending_count": counts.get("pending", 0),
        "rewarded_count": counts.get("rewarded", 0),
        "bonus_minutes_earned": bonus_mins,
    }


# --- Admin Endpoints ---

@admin_coupons_router.get("/coupons")
async def admin_list_coupons(
    search: str | None = None,
    is_active: int | None = None,
    session: dict = Depends(admin_auth.require_permission("view_coupons")),
) -> dict[str, Any]:
    sweep_expired_reservations()

    query = "SELECT code, discount_type, discount_value, max_discount_paise, min_order_paise, max_redemptions, current_redemptions, max_per_user, new_customer_only, eligible_plans, is_active, expires_at, created_by, created_at FROM coupons WHERE 1=1"
    params: list[Any] = []

    if search:
        query += " AND code LIKE ?"
        params.append(f"%{search.strip().upper()}%")
    if is_active is not None:
        query += " AND is_active = ?"
        params.append(is_active)

    query += " ORDER BY created_at DESC;"

    with db.db() as conn:
        rows = conn.execute(query, params).fetchall()

    coupons = []
    for r in rows:
        coupons.append({
            "code": r[0],
            "discount_type": r[1],
            "discount_value": r[2],
            "max_discount_paise": r[3],
            "min_order_paise": r[4],
            "max_redemptions": r[5],
            "current_redemptions": r[6],
            "max_per_user": r[7],
            "new_customer_only": bool(r[8]),
            "eligible_plans": json.loads(r[9]) if r[9] else [],
            "is_active": bool(r[10]),
            "expires_at": r[11],
            "created_by": r[12],
            "created_at": r[13],
        })

    return {"coupons": coupons, "total": len(coupons)}


@admin_coupons_router.post("/coupons")
async def admin_create_coupon(
    req: CouponCreateRequest,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_coupons")),
) -> dict[str, Any]:
    # Discounts above 60% cap require step-up re-prompt
    if req.discount_type == "percent" and req.discount_value > MAX_DISCOUNT_PERCENT:
        admin_auth.require_step_up(session)

    clean_code = req.code.strip().upper()
    now_iso = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        existing = conn.execute("SELECT code FROM coupons WHERE code = ?;", (clean_code,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail=f"Coupon '{clean_code}' already exists.")

        conn.execute(
            """
            INSERT INTO coupons (code, discount_type, discount_value, max_discount_paise, min_order_paise, max_redemptions, current_redemptions, max_per_user, new_customer_only, eligible_plans, is_active, expires_at, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 1, ?, ?, ?);
            """,
            (
                clean_code,
                req.discount_type,
                req.discount_value,
                req.max_discount_paise,
                req.min_order_paise,
                req.max_redemptions,
                req.max_per_user,
                1 if req.new_customer_only else 0,
                json.dumps(req.eligible_plans),
                req.expires_at,
                session["email"],
                now_iso,
            ),
        )

    audit.record_audit_event(
        actor_email=session["email"],
        action="create_coupon",
        entity_type="coupon",
        entity_id=clean_code,
        payload={"code": clean_code, "discount_type": req.discount_type, "discount_value": req.discount_value},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )

    return {"status": "created", "code": clean_code}


@admin_coupons_router.post("/coupons/bulk")
async def admin_bulk_generate_coupons(
    req: BulkCouponCreateRequest,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_coupons")),
) -> dict[str, Any]:
    # Bulk creation above 50 coupons requires step-up
    if req.count > 50:
        admin_auth.require_step_up(session)

    now_iso = datetime.now(timezone.utc).isoformat()
    generated_codes: list[str] = []

    with db.db() as conn:
        for _ in range(req.count):
            code = f"{req.prefix.strip().upper()}-{secrets.token_hex(3).upper()}"
            conn.execute(
                """
                INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, max_discount_paise, min_order_paise, max_redemptions, current_redemptions, max_per_user, new_customer_only, eligible_plans, is_active, expires_at, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?, 1, ?, ?, ?);
                """,
                (
                    code,
                    req.discount_type,
                    req.discount_value,
                    req.max_discount_paise,
                    req.min_order_paise,
                    req.max_redemptions_per_coupon,
                    json.dumps(req.eligible_plans),
                    req.expires_at,
                    session["email"],
                    now_iso,
                ),
            )
            generated_codes.append(code)

    audit.record_audit_event(
        actor_email=session["email"],
        action="bulk_create_coupons",
        entity_type="coupons_bulk",
        entity_id=req.prefix,
        payload={"count": len(generated_codes), "prefix": req.prefix, "partner_id": req.partner_id},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )

    return {"status": "generated", "count": len(generated_codes), "codes": generated_codes}


@admin_coupons_router.patch("/coupons/{code}/status")
async def admin_set_coupon_status(
    code: str,
    payload: dict[str, int],
    request: Request,
    session: dict = Depends(admin_auth.require_permission("manage_coupons")),
) -> dict[str, Any]:
    clean_code = code.strip().upper()
    is_active = payload.get("is_active", 0)

    with db.db() as conn:
        res = conn.execute("UPDATE coupons SET is_active = ? WHERE code = ?;", (is_active, clean_code))
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Coupon not found.")

    audit.record_audit_event(
        actor_email=session["email"],
        action="update_coupon_status",
        entity_type="coupon",
        entity_id=clean_code,
        payload={"is_active": is_active},
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )

    return {"status": "updated", "code": clean_code, "is_active": is_active}


@admin_coupons_router.post("/coupons/simulate")
async def admin_simulate_coupon(
    req: CouponValidateRequest,
    session: dict = Depends(admin_auth.require_permission("view_coupons")),
) -> dict[str, Any]:
    return calculate_pricing(
        plan_id=req.plan_id,
        billing_cycle=req.billing_cycle,
        coupon_code=req.code,
        household_id=req.household_id,
    )


@admin_coupons_router.get("/coupons/redemptions")
async def admin_list_redemptions(
    search_coupon: str | None = None,
    session: dict = Depends(admin_auth.require_permission("view_coupons")),
) -> dict[str, Any]:
    query = """
        SELECT r.id, r.coupon_code, r.household_id, r.order_id, r.status, r.discount_paise, r.reserved_at, r.expires_at, r.redeemed_at
        FROM coupon_redemptions r
        WHERE 1=1
    """
    params: list[Any] = []
    if search_coupon:
        query += " AND r.coupon_code = ?"
        params.append(search_coupon.strip().upper())

    query += " ORDER BY r.reserved_at DESC LIMIT 200;"

    with db.db() as conn:
        rows = conn.execute(query, params).fetchall()

    redemptions = []
    for r in rows:
        hh = r[2]
        masked_hh = audit.mask_pii(hh) if not session.get("step_up_active", False) else hh
        redemptions.append({
            "id": r[0],
            "coupon_code": r[1],
            "household_id": masked_hh,
            "order_id": r[3],
            "status": r[4],
            "discount_paise": r[5],
            "reserved_at": r[6],
            "expires_at": r[7],
            "redeemed_at": r[8],
        })

    # Abuse flags: multiple holds across different households in last hour
    abuse_flags = []
    with db.db() as conn:
        abuse_rows = conn.execute(
            """
            SELECT coupon_code, COUNT(DISTINCT household_id) as hh_count, COUNT(*) as total_holds
            FROM coupon_redemptions
            GROUP BY coupon_code
            HAVING total_holds >= 5 AND hh_count >= 3;
            """
        ).fetchall()
        for ar in abuse_rows:
            abuse_flags.append({
                "coupon_code": ar[0],
                "households_count": ar[1],
                "total_holds": ar[2],
                "flag": "High velocity coupon hold activity detected.",
            })

    return {"redemptions": redemptions, "abuse_flags": abuse_flags}
