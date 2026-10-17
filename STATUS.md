# STATUS (update at the end of every session)

**Last updated:** 16 Oct 2026 · **Deadline:** 10 Nov 2026 11:59 PM IST · **Submit target:** 8 Nov

## Phase tracker
| Phase | Window | Status | Owner |
|---|---|---|---|
| 0 Setup + spikes | 13-15 Oct | **Done** (scaffold + fake sockets + unit tests complete) | A + B |
| 1 Realtime pipeline | 16-19 Oct | **Done offline** (WS framing, reconnect, 14:30 roll, mock STT, VAD settings verified) | A |
| 2 Detector v1 + dictionaries | 16-22 Oct | **Done** (5-stage digital arrest scorer, Hinglish normaliser, 100% eval on fixtures) | B |
| 3 Intervention + echo gate + UI | 20-23 Oct | **Done** (echo gate, personalized warning clips, giant elder UI, judge mode telemetry) | A + B |
| 4 Guardian onboarding, consent, cloning, alerts | 24-27 Oct | **Done** (SQLite persistence, 5-step wizard, liveness gate, Telegram alert, timeline feedback) | A + B |
| Sprint 2 Hardening & Scale | 16-17 Oct | **Done** (Bearer auth isolation, device health, live intercom, 68 eval fixtures, camera polish) | A + B |
| Sprint 3 Live-ready, Honest, Camera-ready | 17 Oct | **Done** (credit caps, silence gate, ambient + blind eval, real audio runner, Windows run.ps1, token hashing, demo kit, claims audit) | A + B |
| 5 Launch (nominated post) | 28 Oct | Scaffolded / In preparation | A + B |
| 6 Eval + hardening (+ optional LLM layer) | 28 Oct-2 Nov | S1 LLM second-opinion layer scaffolded + tested; eval harness active | B / A |
| 7 Polish, demo video, submission | 3-8 Nov | In preparation | A + B |
| Buffer | 9-10 Nov | | |

## Done in Sprint 3 ("Live-ready, honest, camera-ready")
- **S3-A. Listening Modes & Credit Guard:**
  - Standby default (mic OFF, 30s heartbeat only); Call mode with 3-minute silence auto-stop and 20-minute total call hard cap.
  - Optional Hands-free mode (OFF by default, requires explicit user checkbox disclosure) featuring client-side local energy-VAD ring buffer uploading only after $\ge 10\text{ s}$ sustained speech.
  - Hard quota cap `MAX_STT_MINUTES_PER_DAY` (env, default 30 min) tracked in SQLite `daily_usage` table; sessions gracefully refused with UI notification when exceeded.
  - Judge panel displays daily STT minutes used and quota limits via `GET /api/usage`.
  - Client-side silence gating in Web Audio Worklet (`worklet.js`) calculating RMS with a 250 threshold and 15-frame hangover (~480ms) to never transmit room silence.
- **S3-B. Ambient False Alarm Shield:**
  - Semantic advisory engine expanded with awareness/PSA/news negation patterns in Hindi, Hinglish, and English (e.g. "digital arrest ek scam hai", RBI Kehta Hai, police raid news bulletins, bank anti-fraud advisories).
  - Built `eval/ambient/` suite with 400 continuous household background segments (200 dev, 200 sealed test) spanning TV news, serials, PSAs, religious kirtan, cooking, and neighborhood chatter.
  - Automated per-1,000-segment false alarm metric in `run_eval.py`: **0.0 alerts / 1,000 segments** (95% Wilson CI: [0.0, 9.5] / 1,000).
- **S3-C. Independent Blind Evaluation:**
  - Authored `docs/EVAL_PROTOCOL.md` defining strict 5-tier evaluation protocol, reporting rules, and mandatory "synthetic text tests" labeling.
  - Ingested 20 independent scripts (`eval/blind/*.jsonl`) written without access to detector dictionaries.
  - Built `eval/run_blind.py` reporting metrics with exact Wilson score 95% binomial confidence intervals without touching or retrofitting detector dictionaries.
- **S3-D. Real-Audio Pipeline:**
  - Created `scripts/real_eval.py` for physical WAV files in `fixtures/audio/real/`: estimates credit cost from `docs/CREDITS_LOG.md` rates (~1.5 credits/min), aborts without `--yes`, supports `--dry-run`, measures key-term hit rate against ASR, plots detector stage timeline, and renders `eval/real_runs/summary.md` and `results_card.svg`.
- **S3-E. Windows PowerShell & Onboarding:**
  - Created native `run.ps1` runner supporting `setup`, `test`, `dev`, `dev-mock`, `eval`, `blind-eval`, `ambient-eval`, `real-eval`, and `live-check` without requiring make or bash.
  - Documented PowerShell commands and browser HTTPS microphone requirements in `README.md`.
  - Audited Gnani auth: verified `GNANI_API_KEY` (`X-API-Key-ID`) is solely used; zero extraneous tokens required.
- **S3-F. Security Follow-ups:**
  - Guardian tokens hashed at rest using SHA-256 (`guardians.token_hash`); raw token emitted once upon creation.
  - Signed HMAC-SHA256 action tokens scoped by purpose (`alert_view` vs `intercom`); `/ws/intercom` strictly rejects alert view tokens. Added token exchange endpoint `POST /api/alert/intercom_token`.
  - Access log middleware in `main.py` strips all query strings from request URLs to prevent logging sensitive action tokens.
  - CORS origins locked down.
  - Live intercom playback automatically activates echo gate (`SessionRunner.gate_until` + tail) with unit tests using fake frames.
- **S3-G. Demo Director Studio & Capture Kit:**
  - Created `apps/web/demo.html`: dedicated one-screen studio for recording 60s pitch videos with elder tablet display, judge telemetry, smartphone Telegram alert pop-up, live timers, and Push-to-Talk intercom simulation.
  - Burned-in `.srt` subtitle export from transcript timeline.
  - Updated `docs/DEMO_SCRIPT.md` with verified figures and live measured placeholders.
- **S3-H. Claims Audit:**
  - Authored `docs/CLAIMS.md` with source URLs, retrieval dates, and verification status for every project claim.
  - Replaced unverified ₹1,750 Cr figure across `docs/PITCH.md` with official NCRP government data: **297,727 complaints and ₹4,057.7 crore lost between 2022 and May 2026** (NewsBytes, 6 Jul 2026, citing News18).

## Latest Numbers
- **Test Suite (`make test` / `run.ps1 test`):** **83 passing**, 0 failing (100% offline, zero credits consumed)
- **Evaluation Harness (`eval/run_eval.py` - Synthetic Text Tests):**
  - **Clean (WER 0%):** Scam Recall: **36/36 (100.0%)** [90.4%, 100.0%] · Benign False Alarms: **0/32 (0.0%)** [0.0%, 10.7%]
  - **WER 10%:** Scam Recall: **36/37 (97.3%)** [86.2%, 99.5%] · Benign False Alarms: **1/33 (3.0%)** [0.5%, 15.3%]
  - **WER 20%:** Scam Recall: **36/37 (97.3%)** [86.2%, 99.5%] · Benign False Alarms: **0/33 (0.0%)** [0.0%, 10.4%]
  - **WER 30%:** Scam Recall: **27/37 (73.0%)** [57.0%, 84.6%] · Benign False Alarms: **1/33 (3.0%)** [0.5%, 15.3%]
  - **Unseen Test Split (WER 20%):** **19/19 (100.0%)** [83.2%, 100.0%]
- **Ambient False Alarm Benchmark (400 segments):**
  - **0 / 400 false alarms** (0.0 alerts / 1,000 segments, 95% Wilson CI: [0.0, 9.5] / 1,000)
- **Independent Blind Evaluation (`eval/run_blind.py` - Unseen Scripts):**
  - **Scam Recall (L2+):** **2 / 10 (20.0%)** [5.7%, 51.0%]
  - **Benign False Alarms:** **0 / 10 (0.0%)** [0.0%, 27.8%]
- **Credits Spent:** 0 / 5,000 (100% budget intact)

## Next 3 Actions
1. Execute guided live check with real key: `python scripts/live_check.py --yes` (consumes ~2.5 credits).
2. Record credit consumption row in `docs/CREDITS_LOG.md`.
3. Record 60-second vertical video demo using `apps/web/demo.html` for competition submission.
