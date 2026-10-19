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
| Sprint F SaaS Frontend & CoinCompass Theme | 18 Oct | **Done** (packages/ui, packages/api-contract, apps/site, apps/app, apps/admin, elder kiosk, 10/10 theme audits) | A + B |
| Sprint A Admin Console & Operations Backbone | 18-19 Oct | **Done** (Phases A0-A9: passwordless TOTP, audit hash chain, SMTP outbox, waitlist CRM, support inbox, coupons 60% cap, visual analytics, export center, 137 tests green) | A + B |
| 5 Launch (nominated post) | 28 Oct | Scaffolded / In preparation | A + B |
| 6 Eval + hardening (+ optional LLM layer) | 28 Oct-2 Nov | S1 LLM second-opinion layer scaffolded + tested; eval harness active | B / A |
| 7 Polish, demo video, submission | 3-8 Nov | In preparation | A + B |
| Buffer | 9-10 Nov | | |

## Done in Sprint A ("Admin console: audit first, then build end to end")
- **A0. Comprehensive Audit & Architecture Plan:**
  - Audited full codebase and authored `docs/ADMIN_AUDIT.md` (Exists/Partial/Missing table and reuse decisions).
  - Authored `docs/ADMIN_PLAN.md` establishing single unified architecture, ANSI SQL migrations, and strict origin isolation.
- **A1. Foundations & Passwordless Admin Auth:**
  - Dynamic brand configuration in `apps/api/app/config.py` (`BRAND_NAME`, `BRAND_DOMAIN`, `TICKET_PREFIX`).
  - Zero passwords: Single-use 10-minute email magic links + mandatory RFC 6238 TOTP (`pyotp`).
  - Admin CLI bootstrap: `python -m app.admin_cli bootstrap-totp <email>`.
  - Cryptographic append-only hash-chained audit log in `apps/api/app/audit.py` with PII masking and anti-tamper verification.
  - Dedicated router mounted at `/admin-api` with separate session cookies, origin validation, and `ADMIN_ENABLED=1` gate.
- **A2. Email Subsystem (SMTP & Outbox):**
  - Outbox pattern in `apps/api/app/email/` with exponential retry backoff, daily volume cap (`EMAIL_DAILY_CAP`), rate limiter (`EMAIL_RATE_PER_MIN`), and local Mailpit / aiosmtpd support.
  - Localized templates in English, Hindi, and Gujarati with strict CR/LF header injection prevention and RFC 8058 one-click unsubscribe headers.
  - Domain DNS authentication validator checking SPF, DKIM, DMARC, and rDNS.
- **A3. Waitlist End-to-End CRM:**
  - Public `POST /api/waitlist` with honeypot bot defense, per-IP rate limits, double opt-in verification links, and unsubscribe portal.
  - Admin Waitlist CRM with multi-attribute filtering, PII masking, single-use invite code generator, and throttled broadcast campaign manager.
- **A4. Support Ticket System & Knowledge Base:**
  - Public intake `/api/support` with automated P0 Scam Emergency protocol dispatching national 1930 / cybercrime.gov.in guidance.
  - Passwordless customer magic portal at `/api/support/t/{token}` with public replies vs internal team notes, SLA countdown timers, canned macros, and CSAT rating collection.
  - Public knowledge base articles at `/api/help/articles`.
- **A5. Coupons & Referral Engine:**
  - Integer paise price math with 18% GST calculation, strict 60% discount ceiling, and 15-minute atomic reservation holds preventing double-spending.
  - Referral codes granting automated bonus minutes upon referee qualifying payment.
  - Payment boundary with `PaymentProvider` interface, `FakePaymentProvider` for full test lifecycles, and `RazorpayProvider` webhook signature skeleton.
- **A6. Visual Analytics & Real Rollups:**
  - Real-time telemetry, period-over-period sparklines, 5-stage conversion funnel, and cost/margin breakdown at `/admin-api/analytics/*`.
  - Synthetic data generator `scripts/seed_demo_data.py` (refuses in production via `ENV=production` check; populates waitlist, households, tickets, coupons, and rollups with `is_demo=1`).
- **A7. Central Data Export Center:**
  - Multi-format streaming exports: CSV, XLSX (`openpyxl`), JSON, and print-ready HTML report.
  - Hardened security: Formula injection neutralization (`=`, `+`, `-`, `@`, `\t`, `\r` prefixed with `'`), UTF-8 BOM (`\ufeff`) for Microsoft Excel Indic script display, and step-up TOTP verification for unmasked PII.
- **A8. Remaining Operations Modules:**
  - Households & elders (suspend/restore with step-up), tabletop kiosks (heartbeat & revoking), false-alarm review queue with staged dictionary proposals, credit ledger adjustments with 10-minute cooling period, changelog RSS 2.0 XML feed (`/api/changelog/rss`), feature flags, and DPDP 30-day statutory SLA data rights queue.
- **A9. QA, Hardening & Documentation:**
  - Authored `docs/ADMIN_RUNBOOK.md`, `docs/EMAIL_DELIVERABILITY.md`, `docs/SUPPORT_PLAYBOOK.md`, and updated `docs/CLAIMS.md` and `docs/ARCHITECTURE.md`.
  - Deep security test suite in `apps/api/tests/test_admin_security_deep.py` proving SQL injection prevention, XSS neutralization, CORS origin rejection, CSRF token validation, brute-force lockout, and customer portal token IDOR protection.
  - Next.js Admin UI (`apps/admin`) upgraded with CoinCompass theme, amber ADMIN bar, DEMO DATASET badge, and Ctrl/Cmd+K command palette.
  - Test suite expanded from 83 to **137 passing tests**, 0 failing (100% offline).

## Latest Numbers
- **Test Suite (`make test` / `run.ps1 test`):** **137 passing**, 0 failing (100% offline, zero credits consumed)
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

## Done in Sprint F ("Kavach SaaS frontend, strict CoinCompass theme")
- **F0. Design System & Theme Engine (`packages/ui`):**
  - Strict CoinCompass theme tokens: `#e3e8dc` body background, 28px rounded frame on `linear-gradient(160deg,#0a2a12 0%,#0d3617 45%,#0a2a12 100%)`, `#c8f542` accent lime, 115deg hatch overlay, and WebGL Aurora canvas.
  - Shared Tailwind preset (`tailwind.preset.js`) and 23 accessible UI components.
  - Automated Playwright theme audit (`scripts/theme-audit.mjs`): **10 passed, 0 failed** across all ports.
- **F0/Contract. Typed API Contract & Mock Adapter (`packages/api-contract`):**
  - Pure TypeScript schemas and mock store for claims, plans, quotes, and team.
  - Strict production mock guard preventing `NEXT_PUBLIC_MOCK=1` from deploying to production.
- **F1. Contest-Safe Reskin of `apps/web`:**
  - `apps/web/theme.css` applied cleanly without altering any DOM ids or JS event handlers.
  - Verified contest demo suite running offline on port 8000; all 83 backend unit tests green.
- **F2. Landing Page (`apps/site` on Port 3000):**
  - Complete 9-section landing experience: Hero with WordReveal H1, 6 floating glass cards, 10 scam families ticker, sourced statistics, 6 features deep-dive, 5-stage story timeline, team avatars, verified quotes, and 28px CTA block.
  - First load JS: 169 kB (static prerendered).
- **F3. Pricing Page (`apps/site/pricing`):**
  - Monthly / Annual toggle (27% savings), 3 tiers (Free, Plus ₹149, Family ₹299), coupon validator (`KAVACH50`), and waitlist API route.
- **F4. Trust, Content & Compliance Hub (`apps/site`):**
  - `/features` (deep-dive, speakerphone acoustics, sub-650ms latency pipeline).
  - `/how-it-works` (second-device living room architecture).
  - `/learn` and 3 factual guides (`/learn/digital-arrest`, `/learn/courier-parcel`, `/learn/kyc-otp`), each ending with mandatory: *"Hang up immediately and call 1930 or visit cybercrime.gov.in"*.
  - `/help` (3-minute setup guide & FAQ accordion), `/contact` (SLA & support email).
  - Full compliance suite with prominent `DRAFT: pending legal review` banner: `/privacy` (zero raw audio, 7-day purge), `/terms`, `/refunds` (14-day guarantee), `/acceptable-use`, `/cookies` (zero ad trackers), `/grievance` (IT Rules 2021 officer details), `/consent-notice` (trilingual EN/HI/GU elder notice), `/security` (`.well-known/security.txt`), `/subprocessors` (Gnani.ai, Razorpay, Telegram).
  - `/changelog` with real milestones, `/changelog/rss.xml`, `/changelog/feed.json`, and `/status`.
- **F5. Passwordless Guardian Auth (`apps/app/auth`):**
  - Mobile phone OTP (`123456`), email magic link, WebAuthn Passkeys, and Google SSO. Strictly zero password fields.
- **F6. Guardian Portal (`apps/app` on Port 3001):**
  - 6-step onboarding wizard (household, elder profile, DPDP consent, 3-phrase voice challenge, pairing code, simulated test call).
  - Real-time dashboard with active status, daily credit guard (12/30 mins), and monthly quotas.
  - Live incident timeline (`/alerts/[id]`) with one-way Push-to-Talk (PTT) caregiver intercom override and false-positive calibration feedback.
  - Billing, usage ledger, Razorpay sandbox modal, and GST tax invoice list (`/billing`).
  - Privacy data rights (`/privacy`): 1-click voice embedding purge and machine-readable JSON household export.
- **F7. Elder Tabletop Kiosk Mode (`apps/app/elder`):**
  - Zero WebGL / zero tilt / minimal motion.
  - High contrast AAA, 48px status text, $\ge 24\text{px}$ body text, 140px giant central touch button.
  - Instant trilingual language toggle (Hindi, English, Gujarati).
  - Live intercom override banner ("Caregiver speaking live...") and emergency Level 3 alarm visuals.
- **F8. Operations & Security Admin Console (`apps/admin` on Port 3002):**
  - Amber top banner: `ADMIN [MOCK, NOT SECURE, DO NOT DEPLOY]`.
  - 12 operations modules: telemetry, households with masked PII, tabletop kiosks, false-alarm queue, credit adjustments, detector stage weights, DPDP queue, feature flags, and immutable audit logs.
  - Privileged step-up re-authentication modal requiring hardware security key / biometric authorization.
- **F9. Hardening & Verification:**
  - `make test`: **83 passed**, 0 failed.
  - `scripts/theme-audit.mjs`: **10 passed, 0 failed** across all active ports.
  - Responsive visual proof screenshots captured to `docs/img/`.
  - Zero paid Gnani credits consumed.

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
