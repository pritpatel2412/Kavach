"""Payment provider interface, FakeProvider, and RazorpayProvider skeleton."""
from __future__ import annotations

import abc
import hashlib
import hmac
import json
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from . import db
from .config import get_settings

log = logging.getLogger("kavach.payments")


class PaymentProvider(abc.ABC):
    @abc.abstractmethod
    def create_order(
        self,
        household_id: str,
        amount_paise: int,
        plan_id: str,
        billing_cycle: str = "monthly",
        currency: str = "INR",
        notes: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Create a payment order."""
        raise NotImplementedError

    @abc.abstractmethod
    def verify_webhook(self, body_bytes: bytes, signature: str) -> dict[str, Any]:
        """Verify webhook signature and return parsed payload."""
        raise NotImplementedError


class FakePaymentProvider(PaymentProvider):
    """Zero-credit test provider with full lifecycle simulation."""

    def create_order(
        self,
        household_id: str,
        amount_paise: int,
        plan_id: str,
        billing_cycle: str = "monthly",
        currency: str = "INR",
        notes: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        order_id = f"ord_fake_{secrets.token_hex(8)}"
        return {
            "order_id": order_id,
            "provider": "fake",
            "amount_paise": amount_paise,
            "currency": currency,
            "status": "created",
            "plan_id": plan_id,
            "billing_cycle": billing_cycle,
            "household_id": household_id,
            "notes": notes or {},
        }

    def verify_webhook(self, body_bytes: bytes, signature: str) -> dict[str, Any]:
        """In fake mode, 'test_signature' or 'valid' is accepted."""
        payload = json.loads(body_bytes.decode("utf-8"))
        if signature in ("test_signature", "valid_signature", "fake_valid"):
            return payload
        # Or if signature matches SHA256 of payload
        expected = hashlib.sha256(body_bytes).hexdigest()
        if hmac.compare_digest(signature, expected):
            return payload
        raise ValueError("Invalid fake webhook signature.")

    def simulate_payment_success(
        self,
        order_id: str,
        household_id: str,
        amount_paise: int,
    ) -> dict[str, Any]:
        """Helper to generate a verified payment event for tests."""
        payment_id = f"pay_fake_{secrets.token_hex(8)}"
        event = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": payment_id,
                        "order_id": order_id,
                        "amount": amount_paise,
                        "currency": "INR",
                        "status": "captured",
                        "notes": {"household_id": household_id},
                    }
                }
            },
        }
        raw_bytes = json.dumps(event).encode("utf-8")
        return {
            "body": raw_bytes,
            "signature": "valid_signature",
            "payment_id": payment_id,
        }


class RazorpayProvider(PaymentProvider):
    """Skeleton for live Razorpay payments (test mode, HMAC-SHA256 verification, idempotent)."""

    def __init__(
        self,
        key_id: str | None = None,
        key_secret: str | None = None,
        webhook_secret: str | None = None,
    ):
        settings = get_settings()
        self.key_id = key_id or getattr(settings, "RAZORPAY_KEY_ID", "rzp_test_placeholder")
        self.key_secret = key_secret or getattr(settings, "RAZORPAY_KEY_SECRET", "")
        self.webhook_secret = webhook_secret or getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "")

    def create_order(
        self,
        household_id: str,
        amount_paise: int,
        plan_id: str,
        billing_cycle: str = "monthly",
        currency: str = "INR",
        notes: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        order_id = f"order_rzp_{secrets.token_hex(8)}"
        # ponypay: In test mode without network keys, return mock Razorpay order structure
        return {
            "order_id": order_id,
            "provider": "razorpay",
            "amount_paise": amount_paise,
            "currency": currency,
            "status": "created",
            "key_id": self.key_id,
            "plan_id": plan_id,
            "billing_cycle": billing_cycle,
            "household_id": household_id,
            "notes": notes or {},
        }

    def verify_webhook(self, body_bytes: bytes, signature: str) -> dict[str, Any]:
        """Verify Razorpay X-Razorpay-Signature using HMAC SHA256."""
        if not self.webhook_secret:
            raise ValueError("RAZORPAY_WEBHOOK_SECRET is not configured.")

        expected = hmac.new(
            self.webhook_secret.encode("utf-8"),
            body_bytes,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid Razorpay webhook signature.")

        return json.loads(body_bytes.decode("utf-8"))


def get_payment_provider(provider_name: str = "fake") -> PaymentProvider:
    if provider_name.lower() == "razorpay":
        return RazorpayProvider()
    return FakePaymentProvider()


def process_payment_success(
    order_id: str,
    payment_id: str,
    amount_paise: int,
    provider: str,
    raw_payload: dict,
) -> dict[str, Any]:
    """Idempotently record payment success, fulfill order, redeem reserved coupon, and activate subscription."""
    now_iso = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        # Check if already processed (idempotency)
        existing_pay = conn.execute(
            "SELECT id FROM payments WHERE provider_payment_id = ?;",
            (payment_id,),
        ).fetchone()
        if existing_pay:
            return {"status": "already_processed", "payment_id": existing_pay[0]}

        order_row = conn.execute(
            "SELECT id, household_id, plan_id, billing_cycle, coupon_code, status FROM orders WHERE id = ?;",
            (order_id,),
        ).fetchone()
        if not order_row:
            raise ValueError(f"Order {order_id} not found.")

        _, household_id, plan_id, billing_cycle, coupon_code, order_status = order_row

        # Record payment
        pay_id = f"pay_{secrets.token_hex(8)}"
        conn.execute(
            """
            INSERT INTO payments (id, order_id, household_id, provider, amount_paise, currency, status, provider_payment_id, raw_event_json, created_at)
            VALUES (?, ?, ?, ?, ?, 'INR', 'captured', ?, ?, ?);
            """,
            (pay_id, order_id, household_id, provider, amount_paise, payment_id, json.dumps(raw_payload), now_iso),
        )

        # Update order status
        conn.execute(
            "UPDATE orders SET status = 'paid', payment_id = ?, updated_at = ? WHERE id = ?;",
            (pay_id, now_iso, order_id),
        )

        # Activate or update subscription
        period_days = 365 if billing_cycle == "yearly" else 30
        end_dt = datetime.now(timezone.utc) + timedelta(days=period_days)
        sub_id = f"sub_{secrets.token_hex(8)}"

        conn.execute(
            """
            INSERT INTO subscriptions (id, household_id, plan_id, billing_cycle, status, current_period_start, current_period_end, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
            ON CONFLICT(household_id) DO UPDATE SET
                plan_id = excluded.plan_id,
                billing_cycle = excluded.billing_cycle,
                status = 'active',
                current_period_start = excluded.current_period_start,
                current_period_end = excluded.current_period_end,
                updated_at = excluded.updated_at;
            """,
            (sub_id, household_id, plan_id, billing_cycle, now_iso, end_dt.isoformat(), now_iso, now_iso),
        )

    # Post-transaction: redeem reserved coupon if present
    if coupon_code:
        from .plans_config import redeem_coupon
        try:
            redeem_coupon(coupon_code=coupon_code, household_id=household_id, order_id=order_id)
        except Exception as e:
            log.warning("Coupon redemption error for order %s: %s", order_id, e)

    # Check and qualify any pending referral for this household
    qualify_household_referral(household_id)

    return {"status": "success", "payment_id": pay_id, "order_id": order_id}


def qualify_household_referral(referee_household_id: str) -> None:
    """If the referee had a pending referral, reward both referee and referrer."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.db() as conn:
        row = conn.execute(
            "SELECT id, referrer_household_id, reward_minutes FROM referrals WHERE referee_household_id = ? AND status = 'pending';",
            (referee_household_id,),
        ).fetchone()
        if not row:
            return

        ref_id, referrer_id, reward_mins = row
        conn.execute(
            "UPDATE referrals SET status = 'rewarded', qualified_at = ? WHERE id = ?;",
            (now_iso, ref_id),
        )

        # Credit referrer
        conn.execute(
            """
            INSERT INTO credit_ledger (id, household_id, amount_minutes, reason, reference_id, created_at)
            VALUES (?, ?, ?, 'referral_bonus', ?, ?);
            """,
            (f"cred_{secrets.token_hex(8)}", referrer_id, reward_mins, ref_id, now_iso),
        )
        # Credit referee
        conn.execute(
            """
            INSERT INTO credit_ledger (id, household_id, amount_minutes, reason, reference_id, created_at)
            VALUES (?, ?, ?, 'referee_welcome_bonus', ?, ?);
            """,
            (f"cred_{secrets.token_hex(8)}", referee_household_id, reward_mins, ref_id, now_iso),
        )
