from datetime import datetime, timedelta, timezone
from pathlib import Path

from app import db


def test_crud_guardian_elder_session(tmp_path):
    gid, token = db.insert_guardian("Ravi", "m", "123")
    assert token
    eid = db.insert_elder(gid, "Savitri", "hi-IN")
    assert db.get_guardian(gid)["name"] == "Ravi"
    assert db.get_elder(eid)["guardian_id"] == gid
    sid = db.insert_session(eid, synthetic=True)
    db.insert_event(sid, 0, "hello " * 40, ["S1_authority"], 15, 0)
    excerpt = db.get_session(sid)["events"][0]["excerpt"]
    assert len(excerpt) <= 160
    db.insert_alert(sid, 2, True)
    db.finish_session(sid, 70, 2)
    db.set_feedback(sid, "real")
    got = db.get_session(sid)
    assert got["max_level"] == 2 and got["feedback"] == "real"
    assert got["alerts"][0]["delivered"] is True


def test_voice_profile_delete_cascades_clip_rows(tmp_path):
    gid, token = db.insert_guardian("Asha", "f")
    eid = db.insert_elder(gid, "Nani", "hi-IN")
    vid = db.insert_voice_profile(gid, eid, '{"embedding":"SECRET"}', "phrase")
    p = tmp_path / "clips" / vid / "hi-IN_L1.wav"
    p.parent.mkdir(parents=True)
    p.write_bytes(b"RIFF")
    db.insert_clip(vid, 1, "hi-IN", str(p))
    paths = db.delete_voice_profile(vid)
    assert paths == [str(p)]
    assert db.get_voice_profile(vid) is None
    assert db.list_clips(vid) == []


def test_guardian_delete_cascades_elders(tmp_path):
    gid, token = db.insert_guardian("X", "m")
    eid = db.insert_elder(gid, "Y", "en-IN")
    with db.db() as con:
        con.execute("DELETE FROM guardians WHERE id=?", (gid,))
    assert db.get_elder(eid) is None


def test_purge_old_events():
    gid, token = db.insert_guardian("P", "m")
    eid = db.insert_elder(gid, "Q", "hi-IN")
    sid = db.insert_session(eid, True)
    old = (datetime.now(timezone.utc) - timedelta(days=8)).isoformat()
    with db.db() as con:
        con.execute(
            "INSERT INTO events (id, session_id, ts, segment_index, text_excerpt, stages, score, level)"
            " VALUES (?,?,?,?,?,?,?,?)",
            ("olde", sid, old, 0, "secret excerpt", "S1_authority", 15, 0),
        )
        con.execute(
            "INSERT INTO events (id, session_id, ts, segment_index, text_excerpt, stages, score, level)"
            " VALUES (?,?,?,?,?,?,?,?)",
            ("newe", sid, db.utcnow(), 1, "fresh", "S1_authority", 15, 0),
        )
    n = db.purge_old_events(days=7)
    assert n >= 1
    ev = db.get_session(sid)["events"]
    assert all(e["excerpt"] != "secret excerpt" for e in ev)
    assert any(e["excerpt"] == "fresh" for e in ev)
