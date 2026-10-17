"""Independent (blind) evaluation harness for external transcripts (S3-C).

Reads JSONL scenario files from eval/blind/, runs the pure-Python RiskScorer,
and reports metrics with exact Wilson score 95% binomial confidence intervals.
DOES NOT touch or modify any detector dictionaries or rules.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add repo root to sys.path so kavach_detector can be imported
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "detector"))

from kavach_detector import RiskScorer


def wilson_score_interval(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Calculate exact Wilson score 95% binomial confidence interval."""
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1.0 + (z ** 2) / n
    center = (p + (z ** 2) / (2.0 * n)) / denom
    spread = (z * math.sqrt((p * (1.0 - p) / n) + ((z ** 2) / (4.0 * (n ** 2))))) / denom
    lower = max(0.0, center - spread)
    upper = min(1.0, center + spread)
    return lower, upper


def run_blind_evaluation(blind_dir: Path | None = None) -> dict:
    blind_dir = blind_dir or (ROOT / "eval" / "blind")
    jsonl_files = list(blind_dir.glob("*.jsonl"))
    if not jsonl_files:
        print(f"No JSONL files found in {blind_dir}")
        return {}

    calls = []
    for jf in jsonl_files:
        with open(jf, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                try:
                    obj = json.loads(line)
                    calls.append(obj)
                except json.JSONDecodeError as e:
                    print(f"Error parsing {jf}:{line_no}: {e}")

    scam_calls = [c for c in calls if c.get("label") == "scam"]
    benign_calls = [c for c in calls if c.get("label") == "benign"]

    scam_detected = 0
    scam_by_family: dict[str, list[bool]] = {}
    misses = []

    for sc in scam_calls:
        scorer = RiskScorer()
        max_level = 0
        max_score = 0
        fam = sc.get("family", "unknown")
        if fam not in scam_by_family:
            scam_by_family[fam] = []

        for idx, seg in enumerate(sc.get("segments", [])):
            up = scorer.update(seg, segment_index=idx)
            max_level = max(max_level, up.level)
            max_score = max(max_score, up.score)

        detected = max_level >= 2
        scam_by_family[fam].append(detected)
        if detected:
            scam_detected += 1
        else:
            misses.append({
                "id": sc.get("id"),
                "label": "scam",
                "family": fam,
                "max_level": max_level,
                "max_score": max_score,
                "segments": sc.get("segments", []),
            })

    benign_false_alarms = 0
    benign_by_family: dict[str, list[bool]] = {}

    for bc in benign_calls:
        scorer = RiskScorer()
        max_level = 0
        max_score = 0
        fam = bc.get("family", "unknown")
        if fam not in benign_by_family:
            benign_by_family[fam] = []

        for idx, seg in enumerate(bc.get("segments", [])):
            up = scorer.update(seg, segment_index=idx)
            max_level = max(max_level, up.level)
            max_score = max(max_score, up.score)

        false_alarm = max_level >= 2
        benign_by_family[fam].append(false_alarm)
        if false_alarm:
            benign_false_alarms += 1
            misses.append({
                "id": bc.get("id"),
                "label": "benign",
                "family": fam,
                "max_level": max_level,
                "max_score": max_score,
                "segments": bc.get("segments", []),
            })

    # Confidence intervals
    n_scam = len(scam_calls)
    scam_ci = wilson_score_interval(scam_detected, n_scam) if n_scam else (0.0, 0.0)

    n_benign = len(benign_calls)
    benign_ci = wilson_score_interval(benign_false_alarms, n_benign) if n_benign else (0.0, 0.0)

    # Print summary table
    print("\n=======================================================")
    print(" INDEPENDENT BLIND EVALUATION (SYNTHETIC TEXT TESTS)")
    print(" Note: Unseen external scripts; dictionaries untouched.")
    print("=======================================================\n")

    scam_pct = (scam_detected / n_scam * 100.0) if n_scam else 0.0
    benign_pct = (benign_false_alarms / n_benign * 100.0) if n_benign else 0.0

    print(f"Total Blind Calls: {len(calls)}")
    print(f"Scam Recall (L2+ before/at end of call):")
    print(f"  {scam_detected} / {n_scam} ({scam_pct:.1f}%) · 95% CI: [{scam_ci[0]*100:.1f}%, {scam_ci[1]*100:.1f}%]")
    print(f"Benign False Alarm Rate (L2+ trigger):")
    print(f"  {benign_false_alarms} / {n_benign} ({benign_pct:.1f}%) · 95% CI: [{benign_ci[0]*100:.1f}%, {benign_ci[1]*100:.1f}%]\n")

    print("### Scam Breakdown by Family")
    print("| Family | Detected / Total | Recall | 95% CI |")
    print("|---|---|---|---|")
    for fam, res in sorted(scam_by_family.items()):
        k_fam = sum(res)
        n_fam = len(res)
        ci_fam = wilson_score_interval(k_fam, n_fam)
        pct_fam = (k_fam / n_fam * 100) if n_fam else 0.0
        print(f"| {fam} | {k_fam} / {n_fam} | {pct_fam:.1f}% | [{ci_fam[0]*100:.1f}%, {ci_fam[1]*100:.1f}%] |")

    print("\n### Benign Breakdown by Category")
    print("| Category | False Alarms / Total | FA Rate | 95% CI |")
    print("|---|---|---|---|")
    for fam, res in sorted(benign_by_family.items()):
        k_fam = sum(res)
        n_fam = len(res)
        ci_fam = wilson_score_interval(k_fam, n_fam)
        pct_fam = (k_fam / n_fam * 100) if n_fam else 0.0
        print(f"| {fam} | {k_fam} / {n_fam} | {pct_fam:.1f}% | [{ci_fam[0]*100:.1f}%, {ci_fam[1]*100:.1f}%] |")

    if misses:
        print(f"\n[!] Misses / Discrepancies ({len(misses)} total):")
        for m in misses:
            print(f" - [{m['label'].upper()}] id={m['id']} family={m['family']} max_score={m['max_score']} max_level={m['max_level']}")
    else:
        print("\n[OK] Zero misses on independent blind test set.")

    return {
        "total_calls": len(calls),
        "scam_detected": scam_detected,
        "scam_total": n_scam,
        "scam_recall": scam_pct,
        "scam_ci": scam_ci,
        "benign_false_alarms": benign_false_alarms,
        "benign_total": n_benign,
        "benign_fa_rate": benign_pct,
        "benign_ci": benign_ci,
        "misses": misses,
    }


if __name__ == "__main__":
    run_blind_evaluation()
