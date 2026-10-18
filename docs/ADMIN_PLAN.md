# Kavach Admin Console & SaaS Subsystems Architecture Plan (Phase A0)

> **Document:** docs/ADMIN_PLAN.md  
> **Status:** Approved Architecture Plan · Phase A0 Complete  
> **Scope:** Full implementation of Sprint A (Phases A1–A9) with zero credit consumption and non-breaking backward compatibility.

---

## 1. Unified Architecture Specification

### 1.1 Origin & Route Isolation
```
+-------------------------------------------------------------+
|                      Client Layer                           |
|  - Marketing Site:   http://localhost:3000                  |
|  - Guardian App:     http://localhost:3001                  |
|  - Admin Console:    http://localhost:3002 (admin.<DOMAIN>) |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                FastAPI Gateway (Port 8000)                  |
|                                                             |
|  [Public & Guardian Routes]                                 |
|  - /api/config, /api/usage, /api/guardians, /api/sessions   |
|  - /api/waitlist (double opt-in signup)                     |
|  - /api/coupons/validate (pricing engine)                   |
|  - /support (public ticket intake), /support/t/<token>      |
|  - /ws/session, /ws/intercom                                |
|                                                             |
|  [Admin Operations API: /admin-api (Prefix Gate)]           |
|  - Gate: ADMIN_ENABLED=1 (refuses 404/403 if 0)             |
|  - Headers: X-Robots-Tag: noindex, nofollow                 |
|  - Origin Check: Allowed only from admin origin (port 3002) |
|  - Session Cookie: kavach_admin_session (httpOnly, Secure)  |
|  - CSRF Header: X-CSRF-Token                                |
|  - Sub-routers: /auth, /overview, /waitlist, /tickets,      |
|                 /coupons, /analytics, /exports, /devices,   |
|                 /households, /audit, /email, /flags         |
+-------------------------------------------------------------+
```

### 1.2 Brand Single Source of Truth
The entire system will read brand identity parameters from centralized configuration in `apps/api/app/config.py`:
- `BRAND_NAME`: Default `"Kavach"` (customizable via env `BRAND_NAME`).
- `BRAND_DOMAIN`: Default `"kavach.ai"` (customizable via env `BRAND_DOMAIN`).
- `TICKET_PREFIX`: Default `"KAV"` (customizable via env `TICKET_PREFIX`, producing ticket IDs like `KAV-000123`).
- `PUBLIC_BASE_URL`: Base URL for public links (waitlist confirmation, unsubscribe, support portal).

### 1.3 Database & Minimal Migration Runner
- **Engine:** stdlib `sqlite3` in production/dev, keeping SQL standard ANSI syntax 100% portable to PostgreSQL.
- **No ORM:** Clean, typed SQL queries without heavy dependencies.
- **Migration Runner:** `apps/api/app/migrations.py` scans `apps/api/migrations/*.sql` in alphanumeric order:
  - Tracks applied migrations in `schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT)`.
  - Executes each unapplied file inside a database transaction.
  - Automatically runs on server startup during `lifespan`.

---

## 2. File Map of Additions & Modifications

```
kavach/
├── apps/
│   ├── admin/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── auth/page.tsx               # Live magic-link + TOTP login flow
│   │   │   │   ├── page.tsx                    # Multi-tab admin operations console connected to /admin-api
│   │   │   ├── lib/
│   │   │   │   ├── adminApi.ts                 # Typed fetch client with CSRF and error handling
│   │   │   │   └── types.ts                    # Admin UI state and payload types
│   ├── api/
│   │   ├── app/
│   │   │   ├── config.py                       # Brand config (BRAND_NAME, BRAND_DOMAIN, TICKET_PREFIX) + ADMIN_ALLOWED_EMAILS
│   │   │   ├── migrations.py                   # Minimal migration runner (schema_migrations)
│   │   │   ├── admin_auth.py                   # Magic link, TOTP (pyotp), cookie sessions, CSRF, step-up auth, RBAC
│   │   │   ├── admin_cli.py                    # CLI: bootstrap-totp <email>
│   │   │   ├── audit.py                        # Append-only SHA-256 hash-chained audit logging
│   │   │   ├── plans_config.py                 # Integer paise pricing, 18% GST calculation, 60% coupon cap
│   │   │   ├── payments.py                     # PaymentProvider interface, FakeProvider, RazorpayProvider skeleton
│   │   │   ├── email/
│   │   │   │   ├── __init__.py                 # Email subsystem package
│   │   │   │   ├── sender.py                   # Outbox worker, SMTP/Console sender, exponential backoff, rate limits
│   │   │   │   ├── suppression.py              # Suppression list management (unsubscribed, bounced, complaint)
│   │   │   │   ├── templates.py                # Localized Jinja2/string templates (en/hi/gu with English fallback)
│   │   │   │   └── dns_check.py                # SPF/DKIM/DMARC/rDNS live check utility
│   │   │   ├── routes_admin.py                 # Central /admin-api router gathering all admin modules
│   │   │   ├── routes_public_saas.py           # Public POST /api/waitlist, /api/coupons/validate, /support
│   │   │   ├── routes_tickets.py               # Ticket customer portal /support/t/<token> and admin inbox
│   │   │   ├── routes_coupons.py               # Coupon reservation, redemption, simulation, bulk generation
│   │   │   ├── routes_analytics.py             # Telemetry rollups, KPI sparklines, cohort retention, cost/margin
│   │   │   ├── routes_export.py                # CSV (formula sanitized), XLSX (openpyxl), JSON, print-ready HTML
│   │   │   ├── main.py                         # Mounts /admin-api router, CORS, admin-enabled gate, migration runner
│   │   │   └── db.py                           # Migration-backed DB helper functions
│   │   ├── migrations/
│   │   │   ├── 001_initial_core.sql            # Base schema (guardians, elders, sessions, events, alerts)
│   │   │   ├── 002_admin_and_audit.sql         # admin_users, admin_sessions, audit_log (with prev_hash)
│   │   │   ├── 003_email_subsystem.sql         # email_outbox, suppression_list
│   │   │   ├── 004_waitlist.sql                # waitlist, campaigns
│   │   │   ├── 005_support_tickets.sql         # tickets, ticket_messages, ticket_attachments, kb_articles
│   │   │   ├── 006_coupons_and_referrals.sql   # coupons, coupon_redemptions, referrals
│   │   │   └── 007_feature_flags_and_meta.sql  # feature_flags, changelog, false_alarm_reviews
│   │   └── tests/
│   │       ├── test_admin_auth.py              # Magic link, TOTP, lockout, cookie flags, CSRF, step-up
│   │       ├── test_admin_route_sweep.py       # Exhaustive sweep asserting 401/403 without session across /admin-api
│   │       ├── test_audit_hash_chain.py        # Append-only hash chain validation and tamper detection
│   │       ├── test_email_outbox.py            # Local aiosmtpd server test: delivery, rate limit, suppression, header injection
│   │       ├── test_waitlist_double_optin.py   # Signup, confirmation token, deduplication, campaigns, unsubscribe
│   │       ├── test_support_tickets.py         # Intake, SLA clock math, portal IDOR defense, internal notes vs replies
│   │       ├── test_coupons_concurrency.py     # 60% cap, integer paise GST math, race conditions, hold/release lifecycle
│   │       └── test_export_safety.py           # Formula injection neutralization, PII masking, UTF-8 BOM
├── scripts/
│   ├── seed_demo_data.py                       # Realistic synthetic dataset generator (refuses in production)
├── docs/
│   ├── ADMIN_AUDIT.md                          # Phase A0 audit matrix
│   ├── ADMIN_PLAN.md                           # Phase A0 architecture plan
│   ├── ADMIN_RUNBOOK.md                        # Operator guide: env setup, Mailpit, TOTP bootstrap, incident steps
│   ├── EMAIL_DELIVERABILITY.md                 # SPF, DKIM, DMARC, warm-up protocol, suppression rules
│   └── SUPPORT_PLAYBOOK.md                     # SLAs, macro responses, scam-emergency escalation procedures
```

---

## 3. Detailed Phase Execution Roadmap

### Phase A1: Foundations & Admin Auth
- **Environment & Brand Config:**
  - `BRAND_NAME="Kavach"`, `BRAND_DOMAIN="kavach.ai"`, `TICKET_PREFIX="KAV"`, `ADMIN_ALLOWED_EMAILS=""`, `ADMIN_ENABLED=1`.
- **Database Migrations:**
  - Implement `migrations.py` with `schema_migrations` table.
  - Create `migrations/001_initial_core.sql` and `002_admin_and_audit.sql`.
- **Admin Passwordless Auth:**
  - Login Step 1: Admin enters email. System checks against `ADMIN_ALLOWED_EMAILS`. Generates single-use 10-min HMAC token, enqueues email with login link `/auth/verify?token=...`. Always returns identical 200 message to prevent email enumeration.
  - Login Step 2: Clicking magic link transitions to TOTP verification prompt.
  - TOTP Verification: Verifies 6-digit TOTP token using `pyotp.TOTP(secret).verify(code, valid_window=1)`.
  - CLI Bootstrap: `python -m app.admin_cli bootstrap-totp <email>` generates standard Base32 secret, prints QR code/URI once, stores encrypted secret in `admin_users`.
- **Session Management:**
  - Issues `kavach_admin_session` cookie (httpOnly, Secure, SameSite=Lax).
  - Idle timeout: 30 minutes. Absolute timeout: 8 hours.
  - CSRF Token: Double-submit or signed header `X-CSRF-Token` verified on all mutating requests.
  - Step-up Privilege Token: Sensitive actions require TOTP re-entry, yielding a 5-minute scoped token (`admin_step_up`).
- **RBAC Scaffold:**
  - Roles: `owner` (full access, credit adjustments, refunds), `support_agent` (tickets, waitlist view, KB), `viewer` (read-only telemetry).
- **Append-Only Tamper-Evident Audit Log:**
  - `audit_log` table storing `id`, `prev_hash`, `actor_email`, `action`, `entity_type`, `entity_id`, `payload_masked_json`, `ip`, `user_agent`, `timestamp`, `hash`.
  - `hash = sha256(prev_hash + actor + action + entity_type + entity_id + payload_masked + timestamp)`.
  - Admin endpoint `GET /admin-api/audit/verify` re-calculates the complete chain from genesis block and returns tamper report.

### Phase A2: Email Subsystem (SMTP & Outbox)
- **Configuration:**
  - `EMAIL_MODE=console|smtp` (console logs in dev; smtp connects to server).
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_STARTTLS`, `FROM_NAME`, `FROM_EMAIL`, `REPLY_TO`, `EMAIL_RATE_PER_MIN=60`, `EMAIL_DAILY_CAP=1000`.
- **Outbox Pattern:**
  - Table `email_outbox`: status `queued` -> `sending` -> `sent` | `failed` | `suppressed`. Exponential retry backoff.
  - Table `suppression_list`: email, reason (`unsubscribed`, `bounced`, `complaint`, `manual`), created_at.
  - Mandatory headers: `List-Unsubscribe: <url>`, `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, sender physical address footer.
  - Strict header validation: rejects any `\r` or `\n` in recipient, subject, or custom headers to prevent SMTP header injection.
- **Templates:**
  - Localized templates (English, Hindi, Gujarati) for `waitlist_confirm`, `waitlist_welcome`, `beta_invite`, `ticket_received`, `ticket_reply`, `ticket_solved_csat`, `admin_login_link`, `coupon_gift`, `broadcast_base`.
- **Testing:**
  - In-process `aiosmtpd` SMTP test server verifying real SMTP delivery, STARTTLS, auth failure, rate limiting, suppression checks, and header injection rejection.

### Phase A3: Waitlist End to End
- **Public Intake:** `POST /api/waitlist` with name, email/phone, language, city, consent checkbox, honeypot field, per-IP rate limit (`ratelimit.py`).
- **Double Opt-In:** Enqueues confirmation email with signed token link (`/waitlist/confirm?token=...`). Status updates from `pending_confirm` to `confirmed`.
- **Admin Management:** Table with filters (status, language, source, date), bulk tagging, bulk invite generation, CSV export with PII masking, broadcast campaign composer with throttle progress.

### Phase A4: Support Ticket System
- **Intake:** Public `/support` form and in-app authenticated help drawer. Scam emergency category automatically escalates to top priority and immediately replies with verified National Cybercrime Helpline 1930 and `cybercrime.gov.in` protocols.
- **Customer Portal:** Passwordless signed link `/support/t/<token>` allowing customers to view history, post replies, and rate resolution (CSAT 1-5).
- **Admin Inbox:** Views (Unassigned, Mine, Open, Pending, Solved, Scam Emergency, SLA Breached). Internal private notes vs public replies. SLA clock tracking based on priority (Urgent 2h, High 8h, Normal 24h). Keyboard shortcuts (j/k, r, n, e). Canned response macros.

### Phase A5: Coupons & Referrals Engine
- **Engine Rules:**
  - Discount types: percent (capped at 60%), flat paise, extra listening minutes, trial upgrade.
  - Pricing arithmetic strictly in integer paise.
  - GST (18%) calculated on the discounted pre-tax subtotal.
  - 15-minute reservation hold on order initiation; redemption upon webhook payment confirmation; automatic expiry release.
  - Concurrency protection: SQLite transactions with immediate locks to prevent race-condition over-redemption under parallel requests.
- **Payment Interface:**
  - `PaymentProvider` interface with `FakeProvider` (complete lifecycle simulation for tests) and `RazorpayProvider` skeleton with webhook signature verification.

### Phase A6: Visual Analytics
- Real SQL rollup queries for:
  - Telemetry Overview: Active sessions, confirmed waitlist, open tickets, scam alerts L2/L3.
  - Product: Scam families breakdown donut, alerts by hour heatmap, false-alarm rate from caregiver feedback.
  - Cost & Margin: Estimated provider seconds billed vs revenue.
  - Demo Seed Dataset: `scripts/seed_demo_data.py` populates a rich, realistic synthetic dataset clearly flagged with a visible `DEMO DATA` badge in the UI.

### Phase A7: Export Center
- Formats: CSV, XLSX (`openpyxl`), JSON, printable HTML report.
- Security:
  - CSV Formula Injection Neutralization: Escapes cells starting with `=`, `+`, `-`, `@`, `\t`, `\r`.
  - Excel UTF-8 BOM encoding for proper Hindi and Gujarati rendering.
  - PII Masking: Phone (`+91 98*** **210`) and email (`r***l@example.com`) masked by default; unmasking requires verified step-up auth with reason logged in `audit_log`.

### Phase A8: Remaining Admin Modules
- Households & Tabletop Kiosks: Fleet heartbeat status, battery, last seen.
- False Alarm Review Queue: Directly reviews caregiver feedback from session incidents, allows proposing dictionary YAML additions and re-running offline evaluations.
- Credits & Balances: Adjustment modal with step-up verification.
- Feature Flags: Dynamic toggling backed by `feature_flags` table with audit trail.
- DPDP Data Rights Queue: Right to erasure and data portability queue with SLA timers.

### Phase A9: QA, Security Verification & Documentation
- **Security Tests:** Route sweep across all `/admin-api` routes, CSRF verification, XSS input sanitation, SQL injection attempts, IDOR resistance, brute-force lockout, session expiration, and cookie security flags.
- **Runbooks & Guides:**
  - `docs/ADMIN_RUNBOOK.md`
  - `docs/EMAIL_DELIVERABILITY.md`
  - `docs/SUPPORT_PLAYBOOK.md`
- **Verification:** All unit tests green (`make test`), Playwright e2e validation green, `STATUS.md` updated.

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Accidental Gnani Credit Consumption** | Critical | Live Gnani calls remain strictly guarded behind `KAVACH_MOCK_STT=0` and require explicit `--yes` flag on test scripts. All admin tests run 100% offline. |
| **Breaking Existing Contest Demo (`apps/web`)** | Critical | `apps/web` and port 8000 WebSocket session handlers remain untouched. Admin API routes are strictly scoped under `/admin-api`. |
| **Email Credentials Leakage** | High | Zero SMTP credentials in repository or fixtures. Dev mode defaults to `EMAIL_MODE=console` or local `aiosmtpd`. |
| **Formula Injection in Exports** | High | All exported string cells are sanitized by prefixing formula trigger characters (`=`, `+`, `-`, `@`) with a single quote. |
| **Race Conditions in Coupon Redemption** | Medium | Handled via SQLite immediate transactions and atomic increment queries with limit checks. |

---

## 5. Decision: Proceed to Implementation
Both `docs/ADMIN_AUDIT.md` and `docs/ADMIN_PLAN.md` are established as the architectural foundation. Proceed directly to **Phase A1: Foundations & Admin Auth**.
