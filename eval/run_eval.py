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
import math
import sys
from collections import defaultdict
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from kavach_detector import RiskScorer

try:
    from eval.asr_noise import inject_asr_noise
except ImportError:
    from asr_noise import inject_asr_noise


def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Calculate exact Wilson score 95% binomial confidence interval."""
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1.0 + (z ** 2) / n
    center = (p + (z ** 2) / (2.0 * n)) / denom
    spread = (z * math.sqrt((p * (1.0 - p) / n) + ((z ** 2) / (4.0 * (n ** 2))))) / denom
    return max(0.0, center - spread), min(1.0, center + spread)


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


def evaluate_ambient(ambient_dir: Path) -> list[dict]:
    """S3-B: Evaluate ambient benign segments (TV news, serials, PSAs, household talk)."""
    files = sorted(ambient_dir.glob("*.json"))
    segments = []
    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            if isinstance(data, list):
                segments.extend(data)
        except Exception:
            pass

    results = []
    for seg in segments:
        sc = RiskScorer()
        text = seg.get("text", "")
        up = sc.update(text)
        results.append({
            "id": seg.get("id", "ambient"),
            "category": seg.get("category", "unknown"),
            "split": seg.get("split", "dev"),
            "text": text,
            "max_score": up.score,
            "max_level": up.level,
            "l2_alert": up.level >= 2,
        })
    return results


def summarize(rows: list[dict], ambient_rows: list[dict] | None = None) -> str:
    sections = []

    # 1. Main summary per noise condition with Wilson 95% CIs
    by_noise = defaultdict(list)
    for r in rows:
        by_noise[r["noise"]].append(r)

    order_map = {"clean": 0, "snr15": 1, "snr5": 2, "wer_10%": 3, "wer_20%": 4, "wer_30%": 5}
    sorted_noises = sorted(by_noise.keys(), key=lambda n: (order_map.get(n, 99), n))

    main_table = [
        "## Multi-lingual Call Evaluation (Synthetic Text Tests)",
        "| noise | scam calls | L2 before payment | 95% CI | benign calls | false alarms (L2+) | 95% CI |",
        "|---|---|---|---|---|---|---|",
    ]
    for noise in sorted_noises:
        rs = by_noise[noise]
        scams = [r for r in rs if r["label"] == "scam"]
        ben = [r for r in rs if r["label"] == "benign"]
        k_rec = sum(1 for r in scams if r["l2_before_payment"])
        n_scam = len(scams)
        ci_rec = wilson_ci(k_rec, n_scam) if n_scam else (0.0, 0.0)
        rec_pct = (k_rec / n_scam * 100.0) if n_scam else float("nan")

        k_fa = sum(1 for r in ben if r["false_alarm"])
        n_ben = len(ben)
        ci_fa = wilson_ci(k_fa, n_ben) if n_ben else (0.0, 0.0)
        fa_pct = (k_fa / n_ben * 100.0) if n_ben else float("nan")

        main_table.append(
            f"| {noise} | {n_scam} | {k_rec}/{n_scam} ({rec_pct:.1f}%) | [{ci_rec[0]*100:.1f}%, {ci_rec[1]*100:.1f}%] "
            f"| {n_ben} | {k_fa}/{n_ben} ({fa_pct:.1f}%) | [{ci_fa[0]*100:.1f}%, {ci_fa[1]*100:.1f}%] |"
        )
    sections.append("\n".join(main_table))

    # 2. Dev vs Test split breakdown with CIs
    dev_rows = [r for r in rows if r["split"] == "dev"]
    test_rows = [r for r in rows if r["split"] == "test"]
    if dev_rows and test_rows:
        split_table = [
            "\n### Dev vs Test Split Breakdown",
            "| split | noise | scam recall (L2 before payment) | 95% CI | benign false alarms | 95% CI |",
            "|---|---|---|---|---|---|",
        ]
        for split_name, s_rows in [("dev", dev_rows), ("test", test_rows)]:
            for noise in sorted_noises:
                subset = [r for r in s_rows if r["noise"] == noise]
                scams = [r for r in subset if r["label"] == "scam"]
                ben = [r for r in subset if r["label"] == "benign"]
                k_rec = sum(1 for r in scams if r["l2_before_payment"])
                n_scam = len(scams)
                ci_rec = wilson_ci(k_rec, n_scam) if n_scam else (0.0, 0.0)
                rec_pct = (k_rec / n_scam * 100.0) if n_scam else float("nan")

                k_fa = sum(1 for r in ben if r["false_alarm"])
                n_ben = len(ben)
                ci_fa = wilson_ci(k_fa, n_ben) if n_ben else (0.0, 0.0)
                fa_pct = (k_fa / n_ben * 100.0) if n_ben else float("nan")

                split_table.append(
                    f"| {split_name} | {noise} | {k_rec}/{n_scam} ({rec_pct:.1f}%) | [{ci_rec[0]*100:.1f}%, {ci_rec[1]*100:.1f}%] "
                    f"| {k_fa}/{n_ben} ({fa_pct:.1f}%) | [{ci_fa[0]*100:.1f}%, {ci_fa[1]*100:.1f}%] |"
                )
        sections.append("\n".join(split_table))

    # 3. Per Scam Family Breakdown
    scam_rows = [r for r in rows if r["label"] == "scam" and r.get("family") != "unknown"]
    if scam_rows:
        by_fam = defaultdict(lambda: defaultdict(list))
        for r in scam_rows:
            by_fam[r["family"]][r["noise"]].append(r)

        fam_table = [
            "\n### Per Scam Family Recall",
            "| scam family | calls | clean recall | wer_10% recall | wer_20% recall | wer_30% recall |",
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

    # 4. S3-B: Ambient Household False Alarm Evaluation
    if ambient_rows:
        n_amb = len(ambient_rows)
        k_l2 = sum(1 for r in ambient_rows if r["l2_alert"])
        rate_per_1000 = (k_l2 / n_amb * 1000.0) if n_amb else 0.0
        ci_amb = wilson_ci(k_l2, n_amb)
        ci_1000_low = ci_amb[0] * 1000.0
        ci_1000_high = ci_amb[1] * 1000.0

        dev_amb = [r for r in ambient_rows if r["split"] == "dev"]
        test_amb = [r for r in ambient_rows if r["split"] == "sealed_test"]

        amb_table = [
            "\n### Ambient False Alarm Benchmark (S3-B)",
            "Evaluated on continuous household background audio: TV news, serials, PSAs, religious prayers, cooking, and shop chatter.",
            "",
            "| split | total segments | L2+ false alerts | alerts / 1,000 segments | 95% CI (/ 1,000) |",
            "|---|---|---|---|---|",
        ]
        for name, sub in [("dev", dev_amb), ("sealed_test", test_amb), ("total", ambient_rows)]:
            k_s = sum(1 for r in sub if r["l2_alert"])
            n_s = len(sub)
            rate_s = (k_s / n_s * 1000.0) if n_s else 0.0
            ci_s = wilson_ci(k_s, n_s) if n_s else (0.0, 0.0)
            amb_table.append(f"| {name} | {n_s} | {k_s} | {rate_s:.1f} | [{ci_s[0]*1000:.1f}, {ci_s[1]*1000:.1f}] |")

        amb_table.extend([
            "",
            "**Conversion Formula to Alerts per Hour:**",
            "- Formula: `Alerts/Hour = (Alerts / 1,000 segments) * (Segments/Hour) / 1000`",
            f"- At **150 segments/hour** (typical quiet home ambient): **{rate_per_1000 * 150 / 1000.0:.3f} alerts/hour**",
            f"- At **300 segments/hour** (active television / daytime family activity): **{rate_per_1000 * 300 / 1000.0:.3f} alerts/hour**",
            "- *Note: Segments per hour is an acoustic property measured from physical microphone recordings.*",
        ])
        sections.append("\n".join(amb_table))

    return "\n".join(sections)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--transcripts", default="eval/fixtures")
    ap.add_argument("--ambient", default="eval/ambient")
    ap.add_argument("--out", default="eval/out")
    ap.add_argument("--no-noise", action="store_true", help="Only evaluate unmodified fixtures")
    a = ap.parse_args()

    files = sorted(Path(a.transcripts).glob("*.json"))
    rows = []

    noise_levels = [0.0] if a.no_noise else [0.0, 0.10, 0.20, 0.30]

    for p in files:
        call_data = json.loads(p.read_text(encoding="utf-8"))
        for wer in noise_levels:
            rows.append(evaluate_call(p, call_data, wer=wer))

    ambient_dir = Path(a.ambient)
    ambient_rows = evaluate_ambient(ambient_dir) if ambient_dir.is_dir() else None

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    if rows:
        with open(out / "report.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
    md = summarize(rows, ambient_rows)
    (out / "summary.md").write_text(md + "\n", encoding="utf-8")
    print(md)


if __name__ == "__main__":
    main()
