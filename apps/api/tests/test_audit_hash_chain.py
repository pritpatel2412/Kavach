"""Unit tests for append-only audit log, cryptographic hash chaining, and PII masking."""
import sqlite3
import pytest

from app import audit, db


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    test_db = tmp_path / "test_audit.db"
    monkeypatch.setenv("KAVACH_DB", str(test_db))
    db.init_db()
    yield


def test_pii_masking():
    # Email
    assert audit.mask_email("rahul.sharma@example.com") == "r***a@example.com"
    assert audit.mask_email("a@b.com") == "a***@b.com"
    assert audit.mask_email("") == "***"

    # Phone
    assert audit.mask_phone("+91 98765 43210") == "+91*** **210"
    assert audit.mask_phone("9876543210") == "987*** **210"
    assert audit.mask_phone("") == "***"

    # Name
    assert audit.mask_name("Kamla Sharma") == "K***a S***a"
    assert audit.mask_name("Al") == "A*"

    # Dictionary recursion
    raw = {
        "user_email": "elder@kavach.ai",
        "phone_number": "+91 91234 56789",
        "elder_name": "Satish Sharma",
        "account_pan": "ABCDE1234F",
        "nested": {
            "contact_email": "caregiver@kavach.ai",
            "normal_field": 42,
        },
    }
    masked = audit.mask_pii(raw)
    assert masked["user_email"] == "e***r@kavach.ai"
    assert masked["phone_number"] == "+91*** **789"
    assert masked["elder_name"] == "S***h S***a"
    assert masked["account_pan"] == "[REDACTED]"
    assert masked["nested"]["contact_email"] == "c***r@kavach.ai"
    assert masked["nested"]["normal_field"] == 42


def test_audit_hash_chain_integrity():
    # Record multiple events
    e1 = audit.record_audit_event(
        actor_email="admin1@kavach.ai",
        action="login",
        entity_type="session",
        entity_id="s1",
        payload={"ip": "127.0.0.1"},
    )
    assert e1["prev_hash"] == "0" * 64

    e2 = audit.record_audit_event(
        actor_email="admin1@kavach.ai",
        action="update_flag",
        entity_type="feature_flag",
        entity_id="strictSilenceGating",
        payload={"enabled": True},
    )
    assert e2["prev_hash"] == e1["hash"]

    e3 = audit.record_audit_event(
        actor_email="admin2@kavach.ai",
        action="adjust_credit",
        entity_type="household",
        entity_id="hh-1",
        payload={"amount": 100},
    )
    assert e3["prev_hash"] == e2["hash"]

    # Verify chain
    result = audit.verify_audit_chain()
    assert result["valid"] is True
    assert result["total_records"] == 3
    assert result["latest_hash"] == e3["hash"]


def test_audit_hash_chain_tamper_detection():
    # Insert 3 records
    for i in range(3):
        audit.record_audit_event(
            actor_email=f"admin{i}@kavach.ai",
            action=f"action_{i}",
            entity_type="test",
            entity_id=f"id_{i}",
        )

    # Chain initially valid
    assert audit.verify_audit_chain()["valid"] is True

    # Tamper with the second row's payload directly in SQLite
    with db.db() as conn:
        cursor = conn.execute("SELECT id FROM audit_log ORDER BY rowid ASC LIMIT 1 OFFSET 1;")
        tamper_id = cursor.fetchone()[0]
        conn.execute("UPDATE audit_log SET payload_masked = '{\"tampered\": true}' WHERE id = ?;", (tamper_id,))

    # Verification must fail and report the tampered row
    check = audit.verify_audit_chain()
    assert check["valid"] is False
    assert check["broken_at_id"] == tamper_id
    assert "Tampered record" in check["error"]


def test_audit_hash_chain_deletion_detection():
    # Insert 3 records
    e1 = audit.record_audit_event(actor_email="a@kavach.ai", action="act1", entity_type="e")
    e2 = audit.record_audit_event(actor_email="a@kavach.ai", action="act2", entity_type="e")
    e3 = audit.record_audit_event(actor_email="a@kavach.ai", action="act3", entity_type="e")

    # Delete the middle row
    with db.db() as conn:
        conn.execute("DELETE FROM audit_log WHERE id = ?;", (e2["id"],))

    # Verification must fail because e3's prev_hash points to deleted e2
    check = audit.verify_audit_chain()
    assert check["valid"] is False
    assert check["broken_at_id"] == e3["id"]
    assert "Broken chain link" in check["error"]
