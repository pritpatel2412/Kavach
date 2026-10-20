# Kavach Claims & Evidence Audit

> **Purpose:** Source of truth for every statistic, performance claim, and benchmark cited in Kavach's README, PITCH, documentation, and external presentations.
> **Standard:** Every claim must map to a public source URL with retrieval date or a deterministic evaluation artifact path in this repository. Any unverified claim is marked **[UNVERIFIED]** or deleted.

---

## 1. Macro Problem & Market Scale Claims

| Claim / Statistic | Source Citation | Retrieval Date / Verifiability | Status |
|---|---|---|---|
| **297,727 digital arrest / cyber extortion complaints, ₹4,057.7 crore lost (2022 to May 2026)** | Government data from National Cybercrime Reporting Portal (NCRP), reviewed by News18, cited by NewsBytes: [NewsBytes: India's digital arrest scam causes ₹4,000cr losses in 3 years](https://www.newsbytesapp.com/news/science/india-s-digital-arrest-scam-causes-4-000cr-losses-in-3-years/story) | Retrieved: 6 Jul 2026 | **[VERIFIED]** Primary benchmark statistic |
| **15,215 complaints and ₹481.1 crore lost in first five months of 2026** | NCRP / News18 data via NewsBytes article cited above | Retrieved: 6 Jul 2026 | **[VERIFIED]** |
| **Pune senior citizens lost >₹100 crore across 136 cases in 19 months (one 82-yr-old lost ₹10.75 crore)** | Punekar News: [Pune Cyber Police Report](https://www.punekarnews.in/?p=245348) | Retrieved: 21 Sep 2026 | **[VERIFIED]** Average loss in this sourced police dataset was ~₹73.5 lakhs per reported FIR |
| **₹1,750 crore lost in first six months of 2024** | Previously cited in early draft | Replaced with verified ₹4,057.7 crore NCRP multi-year data | **[SUPERSEDED / REMOVED]** |
| **Elderly victims lose entire life savings (avg ₹30–80 lakhs per incident)** | Previously cited generic range | Removed in favor of exact sourced Pune Police dataset (~₹73.5L avg across 136 FIRs) | **[SUPERSEDED / REMOVED]** |
| **Second-device deployment thesis** | Relies on availability of a spare phone or tablet in the home on speakerphone | Architectural assumption; generic "80% households" statistic removed | **[ARCHITECTURE THESIS]** |

---

## 2. Technical Performance Claims (Synthetic Text Tests)

All performance metrics below derive from deterministic, offline evaluation runs without paid API dependencies. In compliance with `docs/EVAL_PROTOCOL.md`, all such numbers are explicitly labelled **"synthetic text tests"**.

### A. Scaled Call Benchmark (37 Scam Calls, 33 Adversarial Benign Calls)
- **Measurement Script:** `eval/run_eval.py`
- **Measurement Artifact:** `eval/out/summary.md`
- **Methodology:** Exact Wilson score 95% binomial confidence intervals.

| Condition / Noise Level | Scam Recall (L2 before payment) | 95% Wilson CI | Benign False Alarm Rate (L2+) | 95% Wilson CI | Status |
|---|---|---|---|---|---|
| **Clean Text (WER 0%)** | 36 / 36 (100.0%) | [90.4%, 100.0%] | 0 / 32 (0.0%) | [0.0%, 10.7%] | **[VERIFIED]** |
| **Light ASR Noise (WER 10%)** | 36 / 37 (97.3%) | [86.2%, 99.5%] | 1 / 33 (3.0%) | [0.5%, 15.3%] | **[VERIFIED]** |
| **Typical Speakerphone (WER 20%)** | 36 / 37 (97.3%) | [86.2%, 99.5%] | 0 / 33 (0.0%) | [0.0%, 10.4%] | **[VERIFIED]** |
| **High Noise (WER 30%)** | 27 / 37 (73.0%) | [57.0%, 84.6%] | 1 / 33 (3.0%) | [0.5%, 15.3%] | **[VERIFIED]** |
| **Unseen Test Split (WER 20%)** | 19 / 19 (100.0%) | [83.2%, 100.0%] | 0 / 15 (0.0%) | [0.0%, 20.4%] | **[VERIFIED]** |

### B. Household Ambient False Alarm Benchmark
- **Measurement Script:** `eval/run_eval.py` (`benchmark_ambient()`)
- **Measurement Fixtures:** `eval/ambient/dev_ambient.json` (200 segments), `eval/ambient/sealed_test_ambient.json` (200 segments)
- **Content Categories:** TV news broadcasts, daily soap serials, RBI/police PSAs, family kitchen chatter, religious prayers/kirtan, neighborhood shop talk.

| Split | Total Segments | False Alarms (L2+) | Alerts / 1,000 Segments | 95% Wilson CI (/ 1,000) | Status |
|---|---|---|---|---|---|
| **Dev Set** | 200 | 0 | 0.0 | [0.0, 18.8] | **[VERIFIED]** |
| **Sealed Test Set** | 200 | 0 | 0.0 | [0.0, 18.8] | **[VERIFIED]** |
| **Total Ambient Pool** | 400 | 0 | 0.0 | [0.0, 9.5] | **[VERIFIED]** |

**Conversion Formula to Alerts per Hour:**
$$\text{Alerts/Hour} = \frac{\text{Alerts}}{1,000\text{ segments}} \times \frac{\text{Segments/Hour}}{1,000}$$
- At **150 segments/hour** (quiet room): **0.000 alerts/hour** (Upper 95% bound: 0.001 alerts/hour)
- At **300 segments/hour** (active television): **0.000 alerts/hour** (Upper 95% bound: 0.003 alerts/hour)

---

## 3. Independent Blind Evaluation Claims (Synthetic Text Tests)

- **Measurement Script:** `eval/run_blind.py`
- **Measurement Fixtures:** `eval/blind/blind_test_scenarios.jsonl` (20 scenarios: 10 scam, 10 benign)
- **Dataset Status:** **BURNED / RECLASSIFIED AS DEVELOPMENT SET AFTER REVISION**
  - *Integrity Note:* The original holdout test resulted in **2 / 10** scam recall. Failure analysis was conducted in Sprint X (documented in `docs/DETECTION_REPORT.md`), and detector dictionaries and rules in `packages/detector/` were tuned to address verb inflections, regional terminology, and structural extortion phrasing.
  - As a result of this inspection and tuning, `eval/blind` is burned as a clean holdout. The true holdout result is reported solely as the original **2/10**. Performance of **10/10** is reported strictly as "development set after revision".
  - Clean holdouts must be placed into `eval/blind_sealed/` by an independent human evaluator; that folder remains strictly uninspected and empty until provided.

| Split / Scenario | Scam Recall (L2+ trigger) | 95% Wilson CI | Benign False Alarm Rate (L2+) | 95% Wilson CI | Status |
|---|---|---|---|---|---|
| **Original Holdout Evaluation (Sprint 3 Baseline)** | **2 / 10 (20.0%)** | [5.7%, 51.0%] | 0 / 10 (0.0%) | [0.0%, 27.8%] | **[VERIFIED - ORIGINAL HOLDOUT]** |
| **Development Set After Revision (Sprint X Re-eval)** | **10 / 10 (100.0%)** | [72.2%, 100.0%] | 0 / 10 (0.0%) | [0.0%, 27.8%] | **[DEVELOPMENT SET AFTER REVISION]** |

*Methodological Note:* All metrics above are from synthetic text tests.

---

## 4. Latency & Real-Time Constraints

| Claim | Measurement / Reference | Status |
|---|---|---|
| **Deterministic RiskScorer latency < 1 ms** | Benchmarked in `packages/detector/tests/`: pure Python in-memory regex scan over tokens | **[VERIFIED]** (synthetic text tests) |
| **Post-transcript processing latency in mock replay < 650 ms** | Replay session benchmark: time from receiving final transcript fragment to emitting WebSocket alert state (excludes STT network latency and speech-end detection) | **[VERIFIED: MOCK REPLAY ONLY]** |
| **Zero-Interception Second Device Architecture** | Acoustic room capture via Web Audio Worklet at 16 kHz PCM 16-bit. No telecom network taps or SIM interception. | **[VERIFIED]** Architecture ground truth |

---

## 5. Security & Privacy Guarantees

| Claim | Implementation & Enforcement | Status |
|---|---|---|
| **Zero raw audio storage on Kavach servers** | Verified in `apps/api/app/session.py` and `worklet.js`: audio chunks are piped straight to STT WebSocket and discarded immediately from memory. Call audio is streamed to Gnani for transcription (retention per Gnani terms, to be confirmed). | **[VERIFIED]** |
| **Transcript truncation & 7-day TTL** | `apps/api/app/db.py`: excerpts capped at 160 characters; SQLite purge runs on start. | **[VERIFIED]** |
| **Tokens hashed at rest (SHA-256)** | `apps/api/app/db.py`: `guardians.token_hash` stores SHA-256 hex; raw token is emitted once upon creation. | **[VERIFIED]** |
| **Purpose-scoped signed links** | `apps/api/app/signed_token.py`: HMAC-SHA256 tokens carry explicit purpose claim (`alert_view` vs `intercom`). Intercom rejects alert view tokens. | **[VERIFIED]** |
| **Designed toward DPDP; not legally reviewed** | Consent granted on paired elder device (tap + notice version `2026-10-elder-v1`); guardian-initiated voice profile deletion (`DELETE /api/guardians/{id}/voice`). Has not undergone formal legal or statutory review. | **[DESIGN INTENT - NOT LEGALLY REVIEWED]** |

---

## 6. Real-Audio Pipeline & Credit Economy

| Claim | Reference | Status |
|---|---|---|
| **Estimated STT cost: ~1.5 credits/min** | Estimated rate noted in `docs/CREDITS_LOG.md`; unverified against official Gnani billing API report. | **[UNMEASURED]** |
| **Zero live credits without explicit flag** | Enforced by `--yes` requirement in `scripts/real_eval.py` and `scripts/live_check.py` | **[VERIFIED]** |
| **Daily STT cap (30 min / day)** | Enforced in `apps/api/app/session.py` via `apps/api/app/db.py` `daily_usage` table. | **[VERIFIED]** |

---

## 7. Admin Console, Security & Governance Claims (Sprint A)

| Claim | Implementation & Enforcement | Status |
|---|---|---|
| **Zero Passwords in Admin System** | Authenticates solely via single-use 10-minute email magic link + mandatory RFC 6238 TOTP (`pyotp`). No password column or input field exists. Tested in `apps/api/tests/test_admin_auth.py`. | **[VERIFIED]** |
| **Dual-Origin & Port Isolation** | Admin UI lives on separate origin (`http://localhost:3002` dev, `admin.<BRAND_DOMAIN>` prod). Backend router mounted strictly at `/admin-api` with separate session cookies, `ADMIN_ENABLED=1` gate, and origin check. Tested in `apps/api/tests/test_admin_route_sweep.py`. | **[VERIFIED]** |
| **Step-Up Verification for Sensitive Actions** | PII unmasking, credit adjustments, refunds, and discounts exceeding 60% cap require fresh 5-minute TOTP step-up token. Tested in `apps/api/tests/test_admin_auth.py`. | **[VERIFIED]** |
| **Cryptographic Hash-Chained Audit Log** | Every administrative mutation stores the SHA-256 hash of the previous row (`apps/api/app/audit.py`), creating an immutable verifiable ledger. Tested in `apps/api/tests/test_audit_hash_chain.py`. | **[VERIFIED]** |
| **Anti-Formula Injection in Exports** | All CSV and Excel export cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are prefixed with `'` to neutralize DDE/formula execution. Tested in `apps/api/tests/test_export_safety.py`. | **[VERIFIED]** |
| **Atomic Coupon Concurrency Protection** | Coupon reservation holds (15 minutes) prevent double-spending or over-redemption under parallel requests. Tested in `apps/api/tests/test_coupons_concurrency.py`. | **[VERIFIED]** |
| **100% Offline Test Coverage (164 tests green)** | Entire test suite executes offline without consuming paid Gnani credits. Verified in `apps/api/tests/` and `packages/detector/tests/`. | **[VERIFIED]** |

