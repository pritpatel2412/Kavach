from pathlib import Path

from app.interventions import InterventionManager


def test_no_repeat_within_cooldown_but_escalates():
    t = [0.0]
    m = InterventionManager(Path("/nonexistent"), "hi-IN", clock=lambda: t[0])
    assert m.decide(0) is None
    assert m.decide(1)["level"] == 1
    t[0] = 5
    assert m.decide(1) is None            # same level inside cooldown
    assert m.decide(2)["level"] == 2      # escalation allowed
    t[0] = 10
    assert m.decide(2) is None
    assert m.decide(1) is None            # never step back down
    t[0] = 100
    assert m.decide(2)["level"] == 2      # after cooldown it may repeat


def test_falls_back_to_english_copy_for_unknown_language():
    m = InterventionManager(Path("/nonexistent"), "xx-XX")
    assert "scam" in m.decide(2)["clip_text"].lower()
