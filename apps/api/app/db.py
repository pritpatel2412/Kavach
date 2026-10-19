"""SQLite persistence (stdlib sqlite3). No ORM. Embeddings are stored but never logged."""
from __future__ import annotations

import hashlib
import logging
import os
import secrets
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator

from .config import ROOT, get_settings

log = logging.getLogger("kavach.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS guardians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('m', 'f')),
  telegram_chat_id TEXT,
  token TEXT,
  token_hash TEXT
);
CREATE TABLE IF NOT EXISTS daily_usage (
  usage_date TEXT PRIMARY KEY,
  minutes REAL DEFAULT 0.0
);
CREATE TABLE IF NOT EXISTS elders (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  phone TEXT
);
CREATE TABLE IF NOT EXISTS voice_profiles (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  elder_id TEXT REFERENCES elders(id) ON DELETE SET NULL,
  embedding_json TEXT NOT NULL,
  consent_ts TEXT NOT NULL,
  liveness_phrase TEXT NOT NULL,
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS clips (
  id TEXT PRIMARY KEY,
  voice_profile_id TEXT NOT NULL REFERENCES voice_profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  language TEXT NOT NULL,
  audio_path TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  elder_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  max_score INTEGER DEFAULT 0,
  max_level INTEGER DEFAULT 0,
  synthetic INTEGER DEFAULT 1,
  feedback TEXT,
  last_heartbeat TEXT,
  offline_alert_sent INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  segment_index INTEGER,
  text_excerpt TEXT,
  stages TEXT,
  score INTEGER,
  level INTEGER,
  reason_en TEXT,
  reason_hi TEXT
);
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  level INTEGER NOT NULL,
  delivered INTEGER NOT NULL,
  action_token TEXT
);
"""


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return uuid.uuid4().hex


def db_path() -> Path:
    raw = os.getenv("KAVACH_DB")
    p = Path(raw) if raw else get_settings().db_path
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def connect() -> sqlite3.Connection:
    con = sqlite3.connect(str(db_path()), check_same_thread=False, timeout=30.0)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


@contextmanager
def db() -> Iterator[sqlite3.Connection]:
    con = connect()
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def init_db() -> None:
    from .migrations import run_migrations
    target = db_path()
    run_migrations(target)
    log.info("sqlite ready and migrated at %s", target)



def purge_old_events(days: int = 7, now: datetime | None = None) -> int:
    """Drop transcript excerpts (and their event/alert rows) older than `days`."""
    cutoff = ((now or datetime.now(timezone.utc)) - timedelta(days=days)).isoformat()
    with db() as con:
        n = con.execute("DELETE FROM events WHERE ts < ?", (cutoff,)).rowcount
        con.execute("DELETE FROM alerts WHERE ts < ?", (cutoff,))
    if n:
        log.info("purged %s events older than %s", n, cutoff)
    return n


def _row(r: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(r) if r is not None else None


def insert_guardian(name: str, gender: str, telegram_chat_id: str | None = None) -> tuple[str, str]:
    """Create a guardian. Token is hashed at rest with SHA-256 and shown once at creation (S3-F)."""
    gid = new_id()
    raw_token = "kav_" + secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    with db() as con:
        con.execute(
            "INSERT INTO guardians (id, name, gender, telegram_chat_id, token, token_hash) VALUES (?,?,?,?,?,?)",
            (gid, name, gender, telegram_chat_id or None, None, token_hash),
        )
    return gid, raw_token


def get_guardian(gid: str) -> dict[str, Any] | None:
    with db() as con:
        return _row(con.execute("SELECT * FROM guardians WHERE id=?", (gid,)).fetchone())


def get_guardian_by_token(token: str) -> dict[str, Any] | None:
    if not token:
        return None
    th = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with db() as con:
        return _row(con.execute("SELECT * FROM guardians WHERE token_hash=? OR token=?", (th, token)).fetchone())


def get_daily_stt_minutes(usage_date: str | None = None) -> float:
    """S3-A: Get cumulative STT audio minutes used for the given date (default today UTC)."""
    if usage_date is None:
        usage_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    with db() as con:
        row = con.execute("SELECT minutes FROM daily_usage WHERE usage_date=?", (usage_date,)).fetchone()
        return float(row["minutes"]) if row else 0.0


def record_stt_minutes(minutes: float, usage_date: str | None = None) -> float:
    """S3-A: Add processed STT audio minutes to the daily usage counter."""
    if usage_date is None:
        usage_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    with db() as con:
        con.execute(
            "INSERT INTO daily_usage (usage_date, minutes) VALUES (?, ?)"
            " ON CONFLICT(usage_date) DO UPDATE SET minutes = minutes + ?",
            (usage_date, minutes, minutes),
        )
        row = con.execute("SELECT minutes FROM daily_usage WHERE usage_date=?", (usage_date,)).fetchone()
        return float(row["minutes"]) if row else 0.0


def list_guardians() -> list[dict[str, Any]]:
    with db() as con:
        return [dict(r) for r in con.execute("SELECT id, name, gender, telegram_chat_id FROM guardians")]


def insert_elder(guardian_id: str, name: str, language: str, phone: str | None = None) -> str:
    eid = new_id()
    with db() as con:
        con.execute(
            "INSERT INTO elders (id, guardian_id, name, language, phone) VALUES (?,?,?,?,?)",
            (eid, guardian_id, name, language, phone or None),
        )
    return eid


def get_elder(eid: str) -> dict[str, Any] | None:
    with db() as con:
        return _row(con.execute("SELECT * FROM elders WHERE id=?", (eid,)).fetchone())


def get_elder_for_guardian(eid: str, gid: str) -> dict[str, Any] | None:
    with db() as con:
        return _row(con.execute("SELECT * FROM elders WHERE id=? AND guardian_id=?", (eid, gid)).fetchone())


def list_elders(guardian_id: str | None = None) -> list[dict[str, Any]]:
    with db() as con:
        if guardian_id:
            return [dict(r) for r in con.execute(
                "SELECT id, guardian_id, name, language, phone FROM elders WHERE guardian_id=?", (guardian_id,))]
        return [dict(r) for r in con.execute("SELECT id, guardian_id, name, language, phone FROM elders")]


def insert_voice_profile(guardian_id: str, elder_id: str | None, embedding_json: str,
                         liveness_phrase: str) -> str:
    vid = new_id()
    with db() as con:
        con.execute(
            "INSERT INTO voice_profiles (id, guardian_id, elder_id, embedding_json, consent_ts, liveness_phrase)"
            " VALUES (?,?,?,?,?,?)",
            (vid, guardian_id, elder_id, embedding_json, utcnow(), liveness_phrase),
        )
    return vid


def get_voice_profile(vid: str, include_embedding: bool = False) -> dict[str, Any] | None:
    with db() as con:
        row = _row(con.execute("SELECT * FROM voice_profiles WHERE id=?", (vid,)).fetchone())
    if row and not include_embedding:
        row.pop("embedding_json", None)
    return row


def get_voice_profile_for_guardian(vid: str, gid: str, include_embedding: bool = False) -> dict[str, Any] | None:
    with db() as con:
        row = _row(con.execute(
            "SELECT * FROM voice_profiles WHERE id=? AND guardian_id=?", (vid, gid)).fetchone())
    if row and not include_embedding:
        row.pop("embedding_json", None)
    return row


def voice_profile_for_elder(elder_id: str) -> dict[str, Any] | None:
    with db() as con:
        row = _row(con.execute(
            "SELECT * FROM voice_profiles WHERE elder_id=? AND deleted_at IS NULL"
            " ORDER BY consent_ts DESC LIMIT 1",
            (elder_id,),
        ).fetchone())
    return row


def insert_clip(voice_profile_id: str, level: int, language: str, audio_path: str) -> str:
    cid = new_id()
    with db() as con:
        con.execute(
            "INSERT INTO clips (id, voice_profile_id, level, language, audio_path) VALUES (?,?,?,?,?)",
            (cid, voice_profile_id, level, language, audio_path),
        )
    return cid


def list_clips(voice_profile_id: str) -> list[dict[str, Any]]:
    with db() as con:
        return [dict(r) for r in con.execute(
            "SELECT * FROM clips WHERE voice_profile_id=? ORDER BY language, level", (voice_profile_id,))]


def get_clip(voice_profile_id: str, level: int) -> dict[str, Any] | None:
    with db() as con:
        return _row(con.execute(
            "SELECT * FROM clips WHERE voice_profile_id=? AND level=? ORDER BY language LIMIT 1",
            (voice_profile_id, level),
        ).fetchone())


def delete_voice_profile(vid: str) -> list[str]:
    """Hard-delete profile + clip rows. Returns clip file paths so the caller can unlink them."""
    with db() as con:
        paths = [r["audio_path"] for r in con.execute(
            "SELECT audio_path FROM clips WHERE voice_profile_id=?", (vid,))]
        con.execute("DELETE FROM voice_profiles WHERE id=?", (vid,))
    return paths


def insert_session(elder_id: str | None, synthetic: bool) -> str:
    sid = new_id()
    now = utcnow()
    with db() as con:
        con.execute(
            "INSERT INTO sessions (id, elder_id, started_at, synthetic, last_heartbeat) VALUES (?,?,?,?,?)",
            (sid, elder_id, now, 1 if synthetic else 0, now),
        )
    return sid


def finish_session(sid: str, max_score: int, max_level: int) -> None:
    with db() as con:
        con.execute(
            "UPDATE sessions SET ended_at=?, max_score=?, max_level=? WHERE id=?",
            (utcnow(), max_score, max_level, sid),
        )


def touch_session_scores(sid: str, score: int, level: int) -> None:
    with db() as con:
        con.execute(
            "UPDATE sessions SET max_score=MAX(max_score, ?), max_level=MAX(max_level, ?) WHERE id=?",
            (score, level, sid),
        )


def update_heartbeat(session_id: str) -> bool:
    with db() as con:
        cur = con.execute("UPDATE sessions SET last_heartbeat=?, offline_alert_sent=0 WHERE id=?", (utcnow(), session_id))
        return cur.rowcount == 1


def get_offline_armed_sessions(cutoff_dt: datetime) -> list[dict[str, Any]]:
    cutoff = cutoff_dt.isoformat()
    with db() as con:
        rows = con.execute(
            """
            SELECT s.id, s.elder_id, s.last_heartbeat, e.name as elder_name,
                   g.id as guardian_id, g.telegram_chat_id
            FROM sessions s
            JOIN elders e ON s.elder_id = e.id
            JOIN guardians g ON e.guardian_id = g.id
            WHERE s.ended_at IS NULL
              AND s.last_heartbeat < ?
              AND (s.offline_alert_sent IS NULL OR s.offline_alert_sent = 0)
            """,
            (cutoff,),
        ).fetchall()
        return [dict(r) for r in rows]


def mark_offline_alert_sent(session_id: str) -> None:
    with db() as con:
        con.execute("UPDATE sessions SET offline_alert_sent=1 WHERE id=?", (session_id,))


def get_latest_session_for_elder(elder_id: str) -> dict[str, Any] | None:
    with db() as con:
        return _row(con.execute(
            "SELECT * FROM sessions WHERE elder_id=? ORDER BY started_at DESC LIMIT 1", (elder_id,)).fetchone())


def insert_event(session_id: str, segment_index: int, excerpt: str, stages: list[str],
                 score: int, level: int, reason_en: str = "", reason_hi: str = "") -> str:
    eid = new_id()
    with db() as con:
        con.execute(
            "INSERT INTO events (id, session_id, ts, segment_index, text_excerpt, stages, score, level, reason_en, reason_hi)"
            " VALUES (?,?,?,?,?,?,?,?,?,?)",
            (eid, session_id, utcnow(), segment_index, excerpt[:160], ",".join(stages), score, level, reason_en, reason_hi),
        )
    return eid


def insert_alert(session_id: str, level: int, delivered: bool, action_token: str | None = None) -> str:
    aid = new_id()
    with db() as con:
        con.execute(
            "INSERT INTO alerts (id, session_id, ts, level, delivered, action_token) VALUES (?,?,?,?,?,?)",
            (aid, session_id, utcnow(), level, 1 if delivered else 0, action_token),
        )
    return aid


def set_feedback(session_id: str, verdict: str) -> bool:
    with db() as con:
        cur = con.execute("UPDATE sessions SET feedback=? WHERE id=?", (verdict, session_id))
        return cur.rowcount == 1


def get_session(sid: str) -> dict[str, Any] | None:
    with db() as con:
        sess = _row(con.execute("SELECT * FROM sessions WHERE id=?", (sid,)).fetchone())
        if not sess:
            return None
        events = [dict(r) for r in con.execute(
            "SELECT ts, segment_index, text_excerpt, stages, score, level, reason_en, reason_hi FROM events"
            " WHERE session_id=? ORDER BY ts", (sid,))]
        alerts = [dict(r) for r in con.execute(
            "SELECT ts, level, delivered, action_token FROM alerts WHERE session_id=? ORDER BY ts", (sid,))]
    sess["synthetic"] = bool(sess.get("synthetic"))
    sess["events"] = [
        {
            "ts": e["ts"],
            "segment_index": e["segment_index"],
            "excerpt": e["text_excerpt"] or "",
            "stages": [s for s in (e["stages"] or "").split(",") if s],
            "score": e["score"],
            "level": e["level"],
            "reason_en": e.get("reason_en") or "",
            "reason_hi": e.get("reason_hi") or "",
        }
        for e in events
    ]
    sess["alerts"] = [
        {
            "ts": a["ts"],
            "level": a["level"],
            "delivered": bool(a["delivered"]),
            "action_token": a.get("action_token"),
        }
        for a in alerts
    ]
    return sess


def get_session_for_guardian(sid: str, gid: str) -> dict[str, Any] | None:
    with db() as con:
        row = con.execute(
            "SELECT s.id FROM sessions s JOIN elders e ON s.elder_id = e.id WHERE s.id=? AND e.guardian_id=?",
            (sid, gid),
        ).fetchone()
        if not row:
            return None
    return get_session(sid)


def list_sessions(guardian_id: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    with db() as con:
        if guardian_id:
            rows = con.execute(
                "SELECT s.id, s.elder_id, s.started_at, s.ended_at, s.max_score, s.max_level, s.synthetic, s.feedback, s.last_heartbeat"
                " FROM sessions s JOIN elders e ON s.elder_id = e.id WHERE e.guardian_id=?"
                " ORDER BY s.started_at DESC LIMIT ?",
                (guardian_id, limit),
            ).fetchall()
        else:
            rows = con.execute(
                "SELECT id, elder_id, started_at, ended_at, max_score, max_level, synthetic, feedback, last_heartbeat"
                " FROM sessions ORDER BY started_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]


# ROOT imported so tests can patch; keep referenced
_ = ROOT
