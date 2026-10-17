"""Replay SAVED transcripts through the detector across WER noise levels.

Zero Gnani credits consumed: 100% offline evaluation.
Evaluates:
1. Noise degradation at WER 0% (clean), 10%, 20%, 30%
2. Dev vs Test split (fixed 50/50 partition; never tuned on test)
3. Per scam family breakdown (digital arrest, courier, kyc, electricity, sim, remote access, etc.)
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

from kavach_detector import RiskScorer

try:
    from eval.asr_noise import inject_asr_noise
except ImportError:
    from asr_noise import inject_asr_noise


def evaluate_call(path: Path, call: dict, wer: float = 0.0, seed: int = 42) -> dict:
    sc = RiskScorer()
    l2_idx = l2_t = s5_idx = None
    for i, seg in enumerate(call["segments"]):
        t = float(seg.get("t", i * 6.5))
        text = seg["text"]
        if wer > 0.0:
            text = inject_asr_noise(text, wer, seed=seed + i * 37)
        up = sc.update(text, i, ts=t)
        if up.level >= 2 and l2_idx is None:
            l2_idx, l2_t = i, t
        if s5_idx is None and any(stage == "S5_payment" for stage, _ in up.hits):
            s5_idx = i
    label = call["label"]
    noise_label = f"wer_{int(wer * 100)}%" if wer > 0.0 else (call.get("noise") or "clean")
    return {
        "file": path.name,
        "id": call.get("id", path.stem),
        "label": label,
        "family": call.get("family", "unknown"),
        "split": call.get("split", "dev"),
        "noise": noise_label,
        "wer": wer,
        "lang": call.get("lang", ""),
        "max_level": sc.max_level,
        "max_score": sc.max_score,
        "l2_segment": l2_idx,
        "l2_time_s": l2_t,
        "first_payment_segment": s5_idx,
        "l2_before_payment": bool(l2_idx is not None and (s5_idx is None or l2_idx <= s5_idx)) if label == "scam" else "",
        "false_alarm": (sc.max_level >= 2) if label == "benign" else "",
    }


def summarize(rows: list[dict]) -> str:
    sections = []

    # 1. Main summary per noise condition
    by_noise = defaultdict(list)
    for r in rows:
        by_noise[r["noise"]].append(r)

    # Sort order: clean, snr15, snr5, wer_10%, wer_20%, wer_30%
    order_map = {"clean": 0, "snr15": 1, "snr5": 2, "wer_10%": 3, "wer_20%": 4, "wer_30%": 5}
    sorted_noises = sorted(by_noise.keys(), key=lambda n: (order_map.get(n, 99), n))

    main_table = ["| noise | scam calls | L2 before payment | benign calls | false alarms (L2+) |",
                  "|---|---|---|---|---|"]
    for noise in sorted_noises:
        rs = by_noise[noise]
        scams = [r for r in rs if r["label"] == "scam"]
        ben = [r for r in rs if r["label"] == "benign"]
        rec = sum(1 for r in scams if r["l2_before_payment"]) / len(scams) if scams else float("nan")
        fa = sum(1 for r in ben if r["false_alarm"]) / len(ben) if ben else float("nan")
        main_table.append(f"| {noise} | {len(scams)} | {rec:.1%} | {len(ben)} | {fa:.1%} |")
    sections.append("\n".join(main_table))

    # 2. Dev vs Test split breakdown
    dev_rows = [r for r in rows if r["split"] == "dev"]
    test_rows = [r for r in rows if r["split"] == "test"]
    if dev_rows and test_rows:
        split_table = [
            "\n### Dev vs Test Split Breakdown",
            "| split | noise | scam recall (L2 before payment) | benign false alarms |",
            "|---|---|---|---|",
        ]
        for split_name, s_rows in [("dev", dev_rows), ("test", test_rows)]:
            for noise in sorted_noises:
                subset = [r for r in s_rows if r["noise"] == noise]
                scams = [r for r in subset if r["label"] == "scam"]
                ben = [r for r in subset if r["label"] == "benign"]
                rec = sum(1 for r in scams if r["l2_before_payment"]) / len(scams) if scams else float("nan")
                fa = sum(1 for r in ben if r["false_alarm"]) / len(ben) if ben else float("nan")
                split_table.append(f"| {split_name} | {noise} | {rec:.1%} ({len(scams)}) | {fa:.1%} ({len(ben)}) |")
        sections.append("\n".join(split_table))

    # 3. Per Scam Family Breakdown (at clean and WER 20%)
    scam_rows = [r for r in rows if r["label"] == "scam" and r.get("family") != "unknown"]
    if scam_rows:
        by_fam = defaultdict(lambda: defaultdict(list))
        for r in scam_rows:
            by_fam[r["family"]][r["noise"]].append(r)

        fam_table = [
            "\n### Per Scam Family Recall",
            "| scam family | total calls | clean recall | wer_10% recall | wer_20% recall | wer_30% recall |",
            "|---|---|---|---|---|---|",
        ]
        for fam in sorted(by_fam.keys()):
            f_data = by_fam[fam]
            tot = len(f_data.get("clean", []))
            r_clean = sum(1 for r in f_data.get("clean", []) if r["l2_before_payment"]) / tot if tot else 0
            t10 = len(f_data.get("wer_10%", []))
            r_10 = sum(1 for r in f_data.get("wer_10%", []) if r["l2_before_payment"]) / t10 if t10 else r_clean
            t20 = len(f_data.get("wer_20%", []))
            r_20 = sum(1 for r in f_data.get("wer_20%", []) if r["l2_before_payment"]) / t20 if t20 else r_clean
            t30 = len(f_data.get("wer_30%", []))
            r_30 = sum(1 for r in f_data.get("wer_30%", []) if r["l2_before_payment"]) / t30 if t30 else r_clean
            fam_table.append(f"| {fam} | {tot} | {r_clean:.0%} | {r_10:.0%} | {r_20:.0%} | {r_30:.0%} |")
        sections.append("\n".join(fam_table))

    return "\n".join(sections)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--transcripts", default="eval/fixtures")
    ap.add_argument("--out", default="eval/out")
    ap.add_argument("--no-noise", action="store_true", help="Only evaluate unmodified fixtures")
    a = ap.parse_args()

    files = sorted(Path(a.transcripts).glob("*.json"))
    rows = []

    noise_levels = [0.0] if a.no_noise else [0.0, 0.10, 0.20, 0.30]

    for p in files:
        call_data = json.loads(p.read_text(encoding="utf-8"))
        for wer in noise_levels:
            # If the fixture already has an acoustic noise tag (e.g. snr5) and wer==0.0, keep it
            rows.append(evaluate_call(p, call_data, wer=wer))

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    if rows:
        with open(out / "report.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
    md = summarize(rows)
    (out / "summary.md").write_text(md + "\n", encoding="utf-8")
    print(md)


if __name__ == "__main__":
    main()
