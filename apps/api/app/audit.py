"""Append-only, tamper-evident audit log with SHA-256 hash chaining and PII masking."""
from __future__ import annotations

import hashlib
import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from . import db

log = logging.getLogger("kavach.audit")
GENESIS_HASH = "0" * 64


def mask_email(email: str | None) -> str:
    if not email or "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = f"{local[0]}***"
    else:
        masked_local = f"{local[0]}***{local[-1]}"
    return f"{masked_local}@{domain}"


def mask_phone(phone: str | None) -> str:
    if not phone:
        return "***"
    clean = re.sub(r"\s+", "", str(phone))
    if len(clean) >= 10:
        return f"{clean[:3]}*** **{clean[-3:]}"
    return f"{clean[:2]}***{clean[-2:]}" if len(clean) > 4 else "***"


def mask_name(name: str | None) -> str:
    if not name:
        return "***"
    parts = name.strip().split()
    masked_parts = []
    for part in parts:
        if len(part) <= 2:
            masked_parts.append(f"{part[0]}*")
        else:
            masked_parts.append(f"{part[0]}***{part[-1]}")
    return " ".join(masked_parts)


def mask_pii(data: Any) -> Any:
    """Recursively mask known PII fields in dictionaries or lists."""
    if isinstance(data, dict):
        masked = {}
        for k, v in data.items():
            k_lower = k.lower()
            if "email" in k_lower and isinstance(v, str):
                masked[k] = mask_email(v)
            elif ("phone" in k_lower or "mobile" in k_lower) and isinstance(v, (str, int)):
                masked[k] = mask_phone(str(v))
            elif ("name" in k_lower or "requester" in k_lower) and isinstance(v, str):
                masked[k] = mask_name(v)
            elif any(s in k_lower for s in ("aadhaar", "pan", "card", "secret", "token", "password")):
                masked[k] = "[REDACTED]"
            else:
                masked[k] = mask_pii(v)
        return masked
    elif isinstance(data, list):
        return [mask_pii(item) for item in data]
    return data


def compute_audit_hash(
    prev_hash: str,
    actor_email: str,
    action: str,
    entity_type: str,
    entity_id: str | None,
    payload_masked: str,
    created_at: str,
) -> str:
    raw = f"{prev_hash}|{actor_email}|{action}|{entity_type}|{entity_id or ''}|{payload_masked}|{created_at}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def record_audit_event(
    actor_email: str,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    payload: dict | None = None,
    ip: str = "",
    user_agent: str = "",
) -> dict:
    """Record an immutable, hash-chained audit event."""
    masked_payload = mask_pii(payload or {})
    payload_json = json.dumps(masked_payload, sort_keys=True, separators=(",", ":"))
    event_id = uuid.uuid4().hex
    created_at = datetime.now(timezone.utc).isoformat()

    with db.db() as conn:
        cursor = conn.execute("SELECT hash FROM audit_log ORDER BY created_at DESC, id DESC LIMIT 1;")
        row = cursor.fetchone()
        prev_hash = row[0] if row else GENESIS_HASH

        current_hash = compute_audit_hash(
            prev_hash=prev_hash,
            actor_email=actor_email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_masked=payload_json,
            created_at=created_at,
        )

        conn.execute(
            """
            INSERT INTO audit_log (
                id, prev_hash, actor_email, action, entity_type, entity_id,
                payload_masked, ip, user_agent, created_at, hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                event_id,
                prev_hash,
                actor_email,
                action,
                entity_type,
                entity_id,
                payload_json,
                ip,
                user_agent,
                created_at,
                current_hash,
            ),
        )

    log.info("Audit log recorded: %s by %s on %s:%s (hash: %s)", action, actor_email, entity_type, entity_id, current_hash[:8])
    return {
        "id": event_id,
        "prev_hash": prev_hash,
        "actor_email": actor_email,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "payload_masked": masked_payload,
        "ip": ip,
        "user_agent": user_agent,
        "created_at": created_at,
        "hash": current_hash,
    }


def verify_audit_chain() -> dict:
    """Verify cryptographic integrity of the entire audit log chain from genesis."""
    with db.db() as conn:
        cursor = conn.execute(
            """
            SELECT id, prev_hash, actor_email, action, entity_type, entity_id,
                   payload_masked, ip, user_agent, created_at, hash
            FROM audit_log ORDER BY created_at ASC, id ASC;
            """
        )
        rows = cursor.fetchall()

    if not rows:
        return {"valid": True, "total_records": 0, "message": "Audit chain empty."}

    expected_prev = GENESIS_HASH
    for i, row in enumerate(rows):
        row_id = row[0]
        actual_prev = row[1]
        actor_email = row[2]
        action = row[3]
        entity_type = row[4]
        entity_id = row[5]
        payload_masked = row[6]
        created_at = row[9]
        actual_hash = row[10]

        # 1. Verify link to previous row
        if actual_prev != expected_prev:
            return {
                "valid": False,
                "broken_at_id": row_id,
                "record_index": i,
                "error": f"Broken chain link: row prev_hash '{actual_prev[:8]}' does not match expected '{expected_prev[:8]}'",
            }

        # 2. Verify row integrity hash
        recalculated_hash = compute_audit_hash(
            prev_hash=actual_prev,
            actor_email=actor_email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_masked=payload_masked,
            created_at=created_at,
        )
        if recalculated_hash != actual_hash:
            return {
                "valid": False,
                "broken_at_id": row_id,
                "record_index": i,
                "error": f"Tampered record: row hash '{actual_hash[:8]}' does not match recalculated '{recalculated_hash[:8]}'",
            }

        expected_prev = actual_hash

    return {
        "valid": True,
        "total_records": len(rows),
        "latest_hash": expected_prev,
        "message": f"Audit chain verified successfully across {len(rows)} records.",
    }


def list_audit_events(
    actor_email: str | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    """Retrieve filtered audit log rows."""
    clauses = []
    params: list[Any] = []
    if actor_email:
        clauses.append("actor_email = ?")
        params.append(actor_email)
    if action:
        clauses.append("action = ?")
        params.append(action)
    if entity_type:
        clauses.append("entity_type = ?")
        params.append(entity_type)

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    query = f"""
        SELECT id, prev_hash, actor_email, action, entity_type, entity_id,
               payload_masked, ip, user_agent, created_at, hash
        FROM audit_log {where}
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])

    with db.db() as conn:
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

    results = []
    for row in rows:
        try:
            payload = json.loads(row[6])
        except Exception:
            payload = {}
        results.append({
            "id": row[0],
            "prev_hash": row[1],
            "actor_email": row[2],
            "action": row[3],
            "entity_type": row[4],
            "entity_id": row[5],
            "payload_masked": payload,
            "ip": row[7],
            "user_agent": row[8],
            "created_at": row[9],
            "hash": row[10],
        })
    return results
