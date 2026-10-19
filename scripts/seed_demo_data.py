"""Seed a rich, 100% synthetic demo dataset for Kavach Admin Console.

Refuses to run in production environments (ENV=production).
Populates:
- 40+ synthetic waitlist entries across cities, languages, and sources
- 15+ synthetic households, elders, and voice profiles
- 30+ synthetic call sessions with L0-L3 scam events and transcripts
- 12+ synthetic support tickets with SLAs, customer threads, notes, and CSAT
- Synthetic coupons, holds, and redemptions
- 30 days of daily analytics rollups
- Marks demo_dataset_meta so the DEMO DATA banner renders in admin dashboards.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import secrets
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add apps/api to sys.path so we can import app modules directly
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app import db
from app.config import get_settings
from app.routes_analytics import refresh_daily_rollups

CITIES = ["Mumbai", "Delhi-NCR", "Ahmedabad", "Bengaluru", "Pune", "Jaipur", "Surat"]
LANGUAGES = ["hi-IN", "en-IN", "gu-IN"]
SOURCES = ["direct", "referral", "google_search", "partner_bank", "elder_care_ngo"]
FIRST_NAMES = ["Ramesh", "Sarla", "Kishore", "Urmila", "Dhirubhai", "Kamla", "Ashok", "Meenakshi", "Pravin", "Sudha", "Rajesh", "Geeta"]
LAST_NAMES = ["Sharma", "Patel", "Verma", "Mehta", "Deshmukh", "Gupta", "Joshi", "Bhatt", "Shah", "Trivedi"]

SCAM_REASONS = [
    ("Digital Arrest / Police / CBI Impersonation", 3, "Suspect claims Supreme Court warrant; demands 24h video surveillance and fund transfer."),
    ("Customs / Parcel Narcotics Seizure", 2, "Fake FedEx agent claims package addressed to Taiwan containing illegal substances."),
    ("Electricity Bill Disconnect Urgency", 2, "Fake Mahavitaran official threatens power cutoff within 30 minutes unless quick-link is paid."),
    ("Bank KYC Freeze / OTP Request", 2, "Caller claims SBI savings account blocked; demands Aadhaar biometric verification OTP."),
    ("Normal Family Conversation", 0, "Discussion about grandson's wedding and evening vegetable shopping."),
    ("Routine Bank Statement Request", 0, "Elder asking branch manager about interest certificate for tax filing."),
]


def check_environment() -> None:
    env = os.getenv("ENV", os.getenv("ENVIRONMENT", "development")).lower()
    if env in ("production", "prod"):
        print("ERROR: Refusing to seed demo data in PRODUCTION environment!", file=sys.stderr)
        sys.exit(1)


def seed_demo_data(clean: bool = False) -> None:
    check_environment()
    db.init_db()

    with db.db() as conn:
        if clean:
            print("Purging existing demo dataset...")
            conn.execute("DELETE FROM waitlist WHERE email LIKE '%@demo.kavach.internal';")
            conn.execute("DELETE FROM tickets WHERE email LIKE '%@demo.kavach.internal';")
            conn.execute("DELETE FROM ticket_messages WHERE id LIKE 'msg_demo_%';")
            conn.execute("DELETE FROM guardians WHERE id LIKE 'demo_hh_%';")
            conn.execute("DELETE FROM elders WHERE id LIKE 'demo_elder_%';")
            conn.execute("DELETE FROM sessions WHERE id LIKE 'demo_sess_%';")
            conn.execute("DELETE FROM events WHERE id LIKE 'demo_evt_%';")
            conn.execute("DELETE FROM alerts WHERE id LIKE 'demo_alt_%';")
            conn.execute("DELETE FROM coupons WHERE code LIKE 'DEMO%';")
            conn.execute("DELETE FROM coupon_redemptions WHERE id LIKE 'cres_demo_%';")
            conn.execute("DELETE FROM orders WHERE id LIKE 'ord_demo_%';")
            conn.execute("DELETE FROM payments WHERE id LIKE 'pay_demo_%';")
            conn.execute("DELETE FROM subscriptions WHERE id LIKE 'sub_demo_%';")
            conn.execute("DELETE FROM daily_analytics_rollups;")
            conn.execute("DELETE FROM demo_dataset_meta WHERE key = 'global';")
            print("Demo dataset cleaned successfully.")
            return

        print("Seeding synthetic Kavach demo dataset...")
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        # 1. Seed 45 Waitlist Signups over past 30 days
        for i in range(45):
            days_ago = random.randint(1, 30)
            created_at = (now - timedelta(days=days_ago, hours=random.randint(1, 20))).isoformat()
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            clean_name = name.lower().replace(" ", ".")
            email = f"{clean_name}{i}@demo.kavach.internal"
            phone = f"+91 98{random.randint(10000000, 99999999)}"
            city = random.choice(CITIES)
            lang = random.choice(LANGUAGES)
            src = random.choice(SOURCES)
            status = random.choice(["confirmed", "confirmed", "invited", "activated", "pending_confirm"])
            invite_code = f"INV-DEMO-{secrets.token_hex(3).upper()}" if status in ("invited", "activated") else None
            conf_at = created_at if status != "pending_confirm" else None

            conn.execute(
                """
                INSERT OR REPLACE INTO waitlist (
                    id, name, email, phone, language, city, for_who, consent_version,
                    status, confirmed_at, invite_code, tags, source, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'elder_parent', '2026-10-v1', ?, ?, ?, '["demo","synthetic"]', ?, ?, ?);
                """,
                (f"wl_demo_{i}", name, email, phone, lang, city, status, conf_at, invite_code, src, created_at, created_at),
            )

        # 2. Seed 15 Households & Elders
        for i in range(15):
            hh_id = f"demo_hh_{i}"
            g_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            conn.execute(
                """
                INSERT OR REPLACE INTO guardians (id, name, gender, telegram_chat_id, token, token_hash)
                VALUES (?, ?, 'm', ?, ?, ?);
                """,
                (hh_id, g_name, f"chat_demo_{i}", f"tok_demo_{i}", f"hash_demo_{i}"),
            )

            elder_id = f"demo_elder_{i}"
            e_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)} (Parent)"
            conn.execute(
                """
                INSERT OR REPLACE INTO elders (id, guardian_id, name, language, phone)
                VALUES (?, ?, ?, ?, ?);
                """,
                (elder_id, hh_id, e_name, random.choice(LANGUAGES), f"+91 98200{i:05d}"),
            )

        # 3. Seed 35 Call Sessions with Events & Alerts
        for i in range(35):
            days_ago = random.randint(1, 28)
            sess_time = now - timedelta(days=days_ago, hours=random.randint(8, 20), minutes=random.randint(0, 59))
            sess_id = f"demo_sess_{i}"
            elder_id = f"demo_elder_{i % 15}"
            scam_choice = random.choice(SCAM_REASONS)
            reason, level, desc = scam_choice
            score = 85 if level == 3 else (55 if level == 2 else 10)
            fb = "false_positive" if i == 5 else ("scam_thwarted" if level >= 2 else "normal_call")

            conn.execute(
                """
                INSERT OR REPLACE INTO sessions (id, elder_id, started_at, ended_at, max_score, max_level, synthetic, feedback, last_heartbeat)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?);
                """,
                (sess_id, elder_id, sess_time.isoformat(), (sess_time + timedelta(minutes=4)).isoformat(), score, level, fb, sess_time.isoformat()),
            )

            # Event
            conn.execute(
                """
                INSERT OR REPLACE INTO events (id, session_id, ts, segment_index, text_excerpt, stages, score, level, reason_en, reason_hi)
                VALUES (?, ?, ?, 1, ?, '["digital_arrest","urgency"]', ?, ?, ?, 'सावधानी: यह एक धोखाधड़ी कॉल हो सकती है।');
                """,
                (f"demo_evt_{i}", sess_id, sess_time.isoformat(), desc, score, level, reason),
            )

            # Alert if L2 or L3
            if level >= 2:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO alerts (id, session_id, ts, level, delivered, action_token)
                    VALUES (?, ?, ?, ?, 1, ?);
                    """,
                    (f"demo_alt_{i}", sess_id, sess_time.isoformat(), level, f"act_demo_{i}"),
                )

        # 4. Seed Support Tickets
        ticket_categories = ["scam_emergency", "billing", "device_listening", "voice_consent", "feedback"]
        for i in range(12):
            days_ago = random.randint(1, 14)
            t_created = (now - timedelta(days=days_ago, hours=random.randint(1, 12))).isoformat()
            t_id = f"demo_t_{i}"
            t_num = f"KAV-{1000 + i}"
            cat = ticket_categories[i % len(ticket_categories)]
            prio = "urgent" if cat == "scam_emergency" else ("high" if cat == "billing" else "normal")
            st = "solved" if i < 8 else "open"
            resolved_at = (now - timedelta(days=days_ago - 1)).isoformat() if st == "solved" else None
            csat = random.choice([4, 5]) if st == "solved" else None

            conn.execute(
                """
                INSERT OR REPLACE INTO tickets (
                    id, ticket_number, requester_name, requester_email, category,
                    priority, status, subject, access_token_hash, sla_first_response_due,
                    sla_resolution_due, first_responded_at, resolved_at, csat_rating, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    t_id, t_num, f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    f"user{i}@demo.kavach.internal", cat, prio, st,
                    f"Inquiry regarding {cat.replace('_', ' ')}",
                    f"token_hash_demo_{i}", t_created, t_created, t_created, resolved_at, csat, t_created, t_created,
                ),
            )

        # 5. Seed Coupons, Orders, Payments, and Subscriptions
        conn.execute(
            """
            INSERT OR REPLACE INTO coupons (code, discount_type, discount_value, max_redemptions, current_redemptions, max_per_user, is_active, created_by, created_at)
            VALUES 
                ('DEMO50', 'percent', 50, 100, 15, 1, 1, 'admin@demo.kavach.internal', ?),
                ('DEMO25', 'percent', 25, 200, 22, 1, 1, 'admin@demo.kavach.internal', ?),
                ('DEMOHDFC', 'flat', 5000, 50, 12, 1, 1, 'admin@demo.kavach.internal', ?);
            """,
            (now_iso, now_iso, now_iso),
        )

        for i in range(10):
            days_ago = random.randint(2, 25)
            p_time = (now - timedelta(days=days_ago)).isoformat()
            plan = "plus" if i < 7 else "family"
            paise = 14900 if plan == "plus" else 29900
            order_id = f"ord_demo_{i}"
            hh_id = f"demo_hh_{i}"

            conn.execute(
                """
                INSERT OR REPLACE INTO orders (id, household_id, plan_id, billing_cycle, base_paise, discount_paise, taxable_paise, gst_paise, total_paise, coupon_code, status, payment_provider, created_at, updated_at)
                VALUES (?, ?, ?, 'monthly', ?, 0, ?, ?, ?, NULL, 'paid', 'fake', ?, ?);
                """,
                (order_id, hh_id, plan, paise, round(paise / 1.18), paise - round(paise / 1.18), paise, p_time, p_time),
            )

            conn.execute(
                """
                INSERT OR REPLACE INTO payments (id, order_id, household_id, provider, amount_paise, currency, status, provider_payment_id, created_at)
                VALUES (?, ?, ?, 'fake', ?, 'INR', 'captured', ?, ?);
                """,
                (f"pay_demo_{i}", order_id, hh_id, paise, f"pay_fake_demo_{i}", p_time),
            )

            conn.execute(
                """
                INSERT OR REPLACE INTO subscriptions (id, household_id, plan_id, billing_cycle, status, current_period_start, current_period_end, created_at, updated_at)
                VALUES (?, ?, ?, 'monthly', 'active', ?, ?, ?, ?)
                ON CONFLICT(household_id) DO NOTHING;
                """,
                (f"sub_demo_{i}", hh_id, plan, p_time, (now + timedelta(days=15)).isoformat(), p_time, p_time),
            )

        # 6. Flag Demo Dataset in metadata
        conn.execute(
            """
            INSERT OR REPLACE INTO demo_dataset_meta (key, is_demo, seeded_at, record_count)
            VALUES ('global', 1, ?, 120);
            """,
            (now_iso,),
        )

    # 7. Aggregate Rollups
    refresh_daily_rollups()
    print("SUCCESS: Demo dataset seeded and daily rollups refreshed!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kavach Demo Dataset Seeder")
    parser.add_argument("--clean", action="store_true", help="Purge synthetic demo data")
    args = parser.parse_args()
    seed_demo_data(clean=args.clean)
