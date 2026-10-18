"""Lightweight migration runner for Kavach SQLite / PostgreSQL ANSI SQL migrations."""
from __future__ import annotations

import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .config import ROOT, get_settings

log = logging.getLogger("kavach.migrations")
MIGRATIONS_DIR = ROOT / "apps" / "api" / "migrations"


def get_db_path(custom_path: Path | str | None = None) -> Path:
    if custom_path:
        return Path(custom_path)
    return get_settings().db_path


def run_migrations(db_path: Path | str | None = None) -> list[str]:
    """Execute all pending numbered SQL migrations in alphanumeric order."""
    target_path = get_db_path(db_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    applied_versions: list[str] = []
    with sqlite3.connect(target_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL
            );
        """)
        conn.commit()

        # Get existing applied migrations
        cursor = conn.execute("SELECT version FROM schema_migrations ORDER BY version ASC;")
        existing = {row[0] for row in cursor.fetchall()}

        if not MIGRATIONS_DIR.is_dir():
            log.warning("Migrations directory not found at %s", MIGRATIONS_DIR)
            return applied_versions

        migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"), key=lambda p: p.name)
        for sql_file in migration_files:
            version = sql_file.name
            if version in existing:
                continue

            log.info("Applying migration %s...", version)
            sql_content = sql_file.read_text(encoding="utf-8")
            
            with conn:
                conn.executescript(sql_content)
                now_iso = datetime.now(timezone.utc).isoformat()
                conn.execute(
                    "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);",
                    (version, now_iso),
                )
            applied_versions.append(version)
            log.info("Applied migration %s successfully", version)

    return applied_versions


def get_migration_status(db_path: Path | str | None = None) -> list[dict]:
    """Return status of all migration files (applied vs pending)."""
    target_path = get_db_path(db_path)
    if not target_path.exists():
        return []

    with sqlite3.connect(target_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL
            );
        """)
        cursor = conn.execute("SELECT version, applied_at FROM schema_migrations;")
        applied_map = {row[0]: row[1] for row in cursor.fetchall()}

    results = []
    if MIGRATIONS_DIR.is_dir():
        for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql"), key=lambda p: p.name):
            v = sql_file.name
            results.append({
                "version": v,
                "applied": v in applied_map,
                "applied_at": applied_map.get(v),
            })
    return results
