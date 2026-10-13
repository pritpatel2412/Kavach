"""Replay SAVED transcripts through the detector (zero credits). Tune dictionaries/thresholds here.

Input : JSON files {"label": "scam"|"benign", "noise": "clean|snr15|snr5", "lang": "...", "segments": [{"text": "...", "t": seconds}]}
Output: report.csv (per call) + summary.md (per noise condition).
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

from kavach_detector import RiskScorer


def evaluate_call(path: Path, call: dict) -> dict:
    sc = RiskScorer()
    l2_idx = l2_t = s5_idx = None
    for i, seg in enumerate(call["segments"]):
        t = float(seg.get("t", i * 8.0))
        up = sc.update(seg["text"], i, ts=t)
        if up.level >= 2 and l2_idx is None:
            l2_idx, l2_t = i, t
        if s5_idx is None and any(stage == "S5_payment" for stage, _ in up.hits):
            s5_idx = i
    label = call["label"]
    return {
        "file": path.name, "label": label, "noise": call.get("noise", "unknown"), "lang": call.get("lang", ""),
        "max_level": sc.max_level, "max_score": sc.max_score, "l2_segment": l2_idx, "l2_time_s": l2_t,
        "first_payment_segment": s5_idx,
        "l2_before_payment": bool(l2_idx is not None and (s5_idx is None or l2_idx < s5_idx)) if label == "scam" else "",
        "false_alarm": (sc.max_level >= 2) if label == "benign" else "",
    }


def summarize(rows: list[dict]) -> str:
    by = defaultdict(list)
    for r in rows:
        by[r["noise"]].append(r)
    out = ["| noise | scam calls | L2 before payment | benign calls | false alarms (L2+) |", "|---|---|---|---|---|"]
    for noise, rs in sorted(by.items()):
        scams = [r for r in rs if r["label"] == "scam"]
        ben = [r for r in rs if r["label"] == "benign"]
        rec = sum(1 for r in scams if r["l2_before_payment"]) / len(scams) if scams else float("nan")
        fa = sum(1 for r in ben if r["false_alarm"]) / len(ben) if ben else float("nan")
        out.append(f"| {noise} | {len(scams)} | {rec:.0%} | {len(ben)} | {fa:.0%} |")
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--transcripts", default="eval/fixtures")
    ap.add_argument("--out", default="eval/out")
    a = ap.parse_args()
    rows = []
    for p in sorted(Path(a.transcripts).glob("*.json")):
        rows.append(evaluate_call(p, json.loads(p.read_text(encoding="utf-8"))))
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    if rows:
        with open(out / "report.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    md = summarize(rows)
    (out / "summary.md").write_text(md + "\n", encoding="utf-8")
    print(md)


if __name__ == "__main__":
    main()
