import json
from pathlib import Path

import numpy as np

from degrade import degrade, mulaw_roundtrip, add_noise
from run_eval import evaluate_call, summarize

FIX = Path(__file__).resolve().parents[1] / "fixtures"


def test_eval_on_fixtures():
    rows = [evaluate_call(p, json.loads(p.read_text(encoding="utf-8"))) for p in sorted(FIX.glob("*.json"))]
    scams = [r for r in rows if r["label"] == "scam"]
    benign = [r for r in rows if r["label"] == "benign"]
    assert scams and benign
    assert all(r["l2_before_payment"] for r in scams), scams
    assert not any(r["false_alarm"] for r in benign), benign
    assert "| clean |" in summarize(rows)


def test_degrade_shapes_and_snr():
    sr = 16000
    x = (0.3 * np.sin(2 * np.pi * 440 * np.arange(sr) / sr)).astype(np.float32)
    y, out_sr = degrade(x, sr, "snr5")
    assert out_sr == 8000 and abs(len(y) - 8000) <= 1
    n = add_noise(x, 5.0) - x
    snr = 10 * np.log10(np.mean(x ** 2) / np.mean(n ** 2))
    assert 4.0 < snr < 6.0
    assert np.max(np.abs(mulaw_roundtrip(x) - x)) < 0.05
