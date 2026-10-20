"""Test-layer seeder with defect workaround for scripts/seed_demo_data.py (D-001).

Applies workaround inside the test layer for clean purge:
uses 'requester_email' instead of 'email' on the tickets table.
"""
from __future__ import annotations
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "apps" / "api"))
sys.path.insert(0, str(ROOT / "scripts"))

from app import db
import seed_demo_data

def run_seed_clean():
    seed_demo_data.check_environment()
    db.init_db()
    with db.db() as conn:
        print("[TEST-SEEDER] Executing test-layer clean purge with correct column requester_email...")
        conn.execute("DELETE FROM waitlist WHERE email LIKE '%@demo.kavach.internal';")
        conn.execute("DELETE FROM ticket_messages WHERE id LIKE 'msg_demo_%';")
        conn.execute("DELETE FROM tickets WHERE requester_email LIKE '%@demo.kavach.internal';")
        conn.execute("DELETE FROM coupon_redemptions WHERE id LIKE 'cres_demo_%';")
        conn.execute("DELETE FROM coupons WHERE code LIKE 'DEMO%';")
        conn.execute("DELETE FROM payments WHERE id LIKE 'pay_demo_%';")
        conn.execute("DELETE FROM subscriptions WHERE id LIKE 'sub_demo_%';")
        conn.execute("DELETE FROM orders WHERE id LIKE 'ord_demo_%';")
        conn.execute("DELETE FROM alerts WHERE id LIKE 'demo_alt_%';")
        conn.execute("DELETE FROM events WHERE id LIKE 'demo_evt_%';")
        conn.execute("DELETE FROM sessions WHERE id LIKE 'demo_sess_%';")
        conn.execute("DELETE FROM elders WHERE id LIKE 'demo_elder_%';")
        conn.execute("DELETE FROM guardians WHERE id LIKE 'demo_hh_%';")
        conn.execute("DELETE FROM daily_analytics_rollups;")
    
    # Run the rest of seed_demo_data without clean=True
    seed_demo_data.seed_demo_data(clean=False)
    print("[TEST-SEEDER] Test demo dataset seeded successfully.")

if __name__ == "__main__":
    run_seed_clean()
