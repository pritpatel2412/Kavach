"""Generate single-source-of-truth facts.json for Kavach repository.

Sprint Y: Consistency invariant.
Generates packages/api-contract/src/facts.json capturing:
- Verified test suite counts (offline tests)
- Scam families catalog (from detector dictionary)
- Subscription plans & pricing (from plans_config.py)
- Sourced benchmark statistics (NCRP and Pune Cyber Police)
- Synthetic evaluation results (holdout baseline vs revised dev set)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))
sys.path.insert(0, str(ROOT / "packages" / "detector"))

import yaml
from app.plans_config import PLANS, GST_RATE


def count_offline_tests() -> int:
    """Count pytest test functions across apps/api/tests, packages/detector/tests, eval/tests."""
    test_dirs = [
        ROOT / "apps" / "api" / "tests",
        ROOT / "packages" / "detector" / "tests",
        ROOT / "eval" / "tests",
    ]
    count = 0
    pattern = re.compile(r"^\s*(?:async\s+)?def\s+(test_\w+)\s*\(", re.MULTILINE)
    for td in test_dirs:
        for py_file in td.glob("test_*.py"):
            text = py_file.read_text(encoding="utf-8")
            matches = pattern.findall(text)
            count += len(matches)
    return count


def load_scam_families() -> list[dict[str, str]]:
    """Extract scam families from packages/api-contract/src/scamFamilies.ts."""
    ts_path = ROOT / "packages" / "api-contract" / "src" / "scamFamilies.ts"
    text = ts_path.read_text(encoding="utf-8")
    families = []
    # Match id, name, hindiName, icon
    pattern = re.compile(
        r"id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*hindiName:\s*'([^']+)',\s*icon:\s*'([^']+)'",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        families.append({
            "id": m.group(1),
            "name": m.group(2),
            "hindi_name": m.group(3),
            "icon": m.group(4),
        })
    return families


def get_plans_data() -> dict:
    """Format plans and pricing."""
    formatted = {}
    for pid, p in PLANS.items():
        formatted[pid] = {
            "id": p["id"],
            "name": p["name"],
            "monthly_inr": p["monthly_paise"] // 100,
            "monthly_paise": p["monthly_paise"],
            "yearly_inr": p["yearly_paise"] // 100,
            "yearly_paise": p["yearly_paise"],
            "gst_inclusive": True,
            "minutes_per_month": p["minutes_per_month"],
            "reserve_minutes": p["reserve_minutes"],
            "elders": p["elders"],
            "devices": p["devices"],
        }
    return formatted


def generate_facts() -> dict:
    test_count = count_offline_tests()
    scam_families = load_scam_families()
    plans = get_plans_data()

    facts = {
        "version": "2026.10.20-sprint-y",
        "generated_at": "2026-10-20T21:45:00Z",
        "testing": {
            "offline_unit_tests": test_count,
            "credits_consumed": 0,
            "framework": "pytest",
            "mock_mode_default": True,
        },
        "scam_families": {
            "count": len(scam_families),
            "families": scam_families,
        },
        "plans": plans,
        "gst_rate": GST_RATE,
        "sourced_statistics": {
            "ncrp": {
                "period": "2022 to May 2026",
                "complaints": 297727,
                "loss_crore": 4057.7,
                "source": "National Cybercrime Reporting Portal (NCRP) via NewsBytes / News18 (6 Jul 2026)",
                "citation_url": "https://www.newsbytesapp.com/news/science/india-s-digital-arrest-scam-causes-4-000cr-losses-in-3-years/story",
            },
            "pune_police": {
                "period": "19 months",
                "elder_cases": 136,
                "loss_crore_plus": 100,
                "avg_loss_per_fir_lakhs": 73.5,
                "single_highest_victim_loss_crore": 10.75,
                "source": "Pune Cyber Police official report via Punekar News (21 Sep 2026)",
                "citation_url": "https://www.punekarnews.in/?p=245348",
            },
        },
        "evaluation_metrics": {
            "type": "synthetic text tests",
            "original_blind_holdout": {
                "status": "BURNED / RECLASSIFIED AS DEV SET AFTER REVISION",
                "scam_recall": "2 / 10 (20.0%)",
                "scam_recall_ci95": "[5.7%, 51.0%]",
                "false_alarm_rate": "0 / 10 (0.0%)",
                "false_alarm_ci95": "[0.0%, 27.8%]",
            },
            "revised_dev_set": {
                "status": "development set after revision",
                "scam_recall": "10 / 10 (100.0%)",
                "scam_recall_ci95": "[72.2%, 100.0%]",
                "false_alarm_rate": "0 / 10 (0.0%)",
            },
            "synthetic_telephony_eval": {
                "wer_20_speakerphone_recall": "36 / 37 (97.3%)",
                "wer_20_ci95": "[86.2%, 99.5%]",
                "ambient_segments_tested": 400,
                "ambient_false_alarms": 0,
                "ambient_rate_per_1k": "0.0 alerts / 1,000 segments",
            },
            "latency": {
                "post_transcript_processing_mock_replay_ms": "< 650 ms",
                "note": "Measured in mock replay; excludes STT network latency and speech-end detection",
            },
        },
        "privacy": {
            "dpdp_alignment": "designed toward DPDP 2023 principles; not legally reviewed",
            "statutory_elder_notice_version": "2026-10-elder-v1",
            "elder_consent_mechanism": "direct tap on paired device screen",
            "audio_transit": "streamed to Gnani Prisma STT (retention per Gnani terms, to be confirmed)",
            "detector_host": "server-side (FastAPI / kavach_detector)",
            "database_host": "server-side (SQLite)",
            "voice_embeddings_storage": "server-side (SQLite, AES-256 encrypted, permanently deletable)",
            "neon_database_region": "AWS Singapore (ap-southeast-1)",
            "ai_gateway_default": "OFF (strictly consent-gated, zero transcripts routed by default)",
        },
    }
    return facts


def main():
    facts = generate_facts()
    out_dir = ROOT / "packages" / "api-contract" / "src"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "facts.json"
    out_path.write_text(json.dumps(facts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Generated single-source-of-truth facts file at: {out_path}")
    print(f"  Offline Unit Tests: {facts['testing']['offline_unit_tests']}")
    print(f"  Scam Families: {facts['scam_families']['count']}")
    print(f"  Plans: {list(facts['plans'].keys())}")
    print("Done.")


if __name__ == "__main__":
    main()
