"""Tests ensuring plans, quotas, and SLAs do not drift between JSON and backend."""
import json
from pathlib import Path
import pytest

from app.plans_config import PLANS, GST_RATE, MAX_DISCOUNT_PERCENT, SLAS

ROOT = Path(__file__).resolve().parents[3]
PLANS_SLA_JSON = ROOT / "packages" / "api-contract" / "src" / "plans_sla.json"


def test_plans_sla_json_exists_and_valid():
    assert PLANS_SLA_JSON.exists(), f"Missing {PLANS_SLA_JSON}"
    with open(PLANS_SLA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert "plans" in data
    assert "slas" in data
    assert "gstRate" in data
    assert "maxDiscountPercent" in data


def test_plans_no_drift():
    with open(PLANS_SLA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    json_plans = {p["id"]: p for p in data["plans"]}

    assert set(PLANS.keys()) == set(json_plans.keys()), "Plan IDs mismatch"

    for pid, plan in PLANS.items():
        j = json_plans[pid]
        assert plan["monthly_paise"] == j["monthlyPaise"], f"Monthly paise drift for {pid}"
        assert plan["yearly_paise"] == j["yearlyPaise"], f"Yearly paise drift for {pid}"
        assert plan["minutes_per_month"] == j["minutesPerMonth"], f"Minutes drift for {pid}"
        assert plan["reserve_minutes"] == j["emergencyReserveMinutes"], f"Reserve drift for {pid}"
        assert plan["elders"] == j["eldersCovered"], f"Elders drift for {pid}"
        assert plan["devices"] == j["devicesSupported"], f"Devices drift for {pid}"


def test_gst_and_discount_cap_no_drift():
    with open(PLANS_SLA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert GST_RATE == data["gstRate"]
    assert MAX_DISCOUNT_PERCENT == data["maxDiscountPercent"]


def test_sla_benchmarks_no_drift():
    with open(PLANS_SLA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    json_slas = data["slas"]
    expected_tiers = {"P0_EMERGENCY", "P1_HIGH", "P2_NORMAL", "P3_LOW"}
    assert set(json_slas.keys()) == expected_tiers
    assert set(SLAS.keys()) == expected_tiers

    assert json_slas["P0_EMERGENCY"]["firstResponseMinutes"] == 15
    assert json_slas["P0_EMERGENCY"]["resolutionMinutes"] == 120
    assert json_slas["P1_HIGH"]["firstResponseMinutes"] == 120
    assert json_slas["P2_NORMAL"]["firstResponseMinutes"] == 480
    assert json_slas["P3_LOW"]["firstResponseMinutes"] == 1440
