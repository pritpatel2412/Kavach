from app.clips import format_clip_text
from app.config import ROOT


def test_gendered_hindi_templates():
    copy = {
        "clip_text": "{guardian_name} बोल रहा हूँ। {elder_name}, रुकिए।",
        "clip_text_f": "{guardian_name} बोल रही हूँ। {elder_name}, रुकिए।",
    }
    m = format_clip_text(copy, elder_name="Savitri", guardian_name="रवि", gender="m")
    f = format_clip_text(copy, elder_name="Savitri", guardian_name="Asha", gender="f")
    assert "बोल रहा हूँ" in m and "रवि" in m
    assert "बोल रही हूँ" in f and "Asha" in f


def test_prerender_script_calls_same_renderer():
    src = (ROOT / "scripts" / "prerender_clips.py").read_text(encoding="utf-8")
    assert "render_profile_clips" in src
