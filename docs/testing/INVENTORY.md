# Kavach System Testing Inventory & Traceability Matrix (Phase T0)

> **Document:** `docs/testing/INVENTORY.md`  
> **Sprint:** T ("Full-system test campaign and evidence report")  
> **Generated:** 19 Oct 2026 · **Timezone:** Asia/Kolkata  
> **Audited Codebase Commit:** Latest `main` workspace state  
> **Environment Constraints:** Zero paid Gnani credits (mock STT `KAVACH_MOCK_STT=1`), synthetic seeds only, zero committed secrets.

---

## 1. UI Routes Inventory

### 1.1 Marketing & Public Site (`@kavach/site` — Port 3000)
| Route | Type | Description & Primary Components | Layout / Frame |
|---|---|---|---|
| `/` | Page (Static) | Marketing landing hero, floating cards, scam statistics, live architecture timeline, FAQ | CoinCompass Frame, AuroraCanvas, HatchOverlay |
| `/features` | Page (Static) | Deep-dive feature breakdown (Acoustic gating, familial timbre clone, privacy) | CoinCompass Frame |
| `/how-it-works` | Page (Static) | 3-step physical setup (second device speakerphone topology, 5-stage engine) | CoinCompass Frame |
| `/pricing` | Page (Static) | Monthly / Yearly INR toggle, 4 plans (Free, Plus, Family, Enterprise), Coupon input | Plan cards, coupon validator |
| `/learn` | Page (Static) | Educational scam prevention hub | CoinCompass Frame |
| `/learn/digital-arrest` | Page (Static) | Deep dive guide on fake police/CBI Supreme Court warrants | Knowledge Hub |
| `/learn/courier-parcel` | Page (Static) | Guide on fake FedEx/customs narcotics extortion scripts | Knowledge Hub |
| `/learn/kyc-otp` | Page (Static) | Guide on bank account freeze & Aadhaar update deception | Knowledge Hub |
| `/contact` | Page (Static) | Customer support intake form, office address, security escalation | Form, emergency advisory |
| `/help` | Page (Static) | Self-help FAQ and knowledge base article links | Accordion, article list |
| `/status` | Page (Static) | Real-time telemetry, 99.98% reliability, live Neon Cloud status | StatusDot, GlassCard |
| `/changelog` | Page (Static) | Product release history and update notes | Changelog timeline |
| `/changelog/feed.json` | API Feed | JSON feed of recent product releases | Application JSON |
| `/changelog/rss.xml` | API Feed | RSS 2.0 XML syndication feed | Application XML |
| `/privacy` | Page (Static) | DPDP Act 2023 compliance, data retention, zero-audio promise | Legal Document |
| `/terms` | Page (Static) | Terms of service, disclaimer of call interception | Legal Document |
| `/security` | Page (Static) | Security architecture, encryption, bug bounty, safe harbor | Security Disclosure |
| `/acceptable-use` | Page (Static) | Prohibited activities, voice cloning owner-only policy | Policy Document |
| `/consent-notice` | Page (Static) | Explicit biometric consent notice for synthetic cloning | Statutory Notice |
| `/grievance` | Page (Static) | Grievance Officer details per IT Rules 2021 | Compliance Card |
| `/refunds` | Page (Static) | 14-day money-back guarantee terms and processing | Policy Document |
| `/cookies` | Page (Static) | Cookie policy (strictly essential session cookies) | Policy Document |
| `/subprocessors` | Page (Static) | List of cloud infrastructure subprocessors (Neon, AWS, Gnani) | Subprocessor Table |
| `/_not-found` | Page (Static) | Custom 404 error page matching theme | 404 Hero |
| `/api/waitlist` | API Route | Frontend proxy route for public waitlist signup | JSON Route Handler |
| `/api/neon-health` | API Route | Live diagnostic probe for Neon Postgres, Auth JWKS & AI Gateway | JSON Route Handler |

### 1.2 Guardian App & Tabletop Device (`@kavach/app` — Port 3001)
| Route | Type | Description & Primary Components | Layout / Frame |
|---|---|---|---|
| `/` | Page (Static) | Guardian telemetry dashboard, active elders list, fleet status | Protected Dashboard |
| `/auth` | Page (Static) | Guardian passwordless login / OTP verification | Auth Card |
| `/onboarding` | Page (Static) | 5-step wizard (Household, Elder, Consent, Voice clone, Pairing) | Onboarding Stepper |
| `/elder` | Page (Static) | Tabletop kiosk mode (large fonts, listening wave, panic stop) | Kiosk Frame |
| `/alerts/[id]` | Page (Dynamic) | Incident drilldown with audio excerpt timeline & intercom relay | Incident Details |
| `/billing` | Page (Static) | Plan tier selection, billing history, invoices, coupon apply | Billing Console |
| `/privacy` | Page (Static) | In-app privacy control, DSR data export & account deletion | Self-service Privacy |
| `/_not-found` | Page (Static) | Custom 404 error page | Error Screen |

### 1.3 Operations Console (`@kavach/admin` — Port 3002)
| Route | Type | Description & Primary Components | Layout / Frame |
|---|---|---|---|
| `/` | Page (Static) | 17-module operations console (Waitlist, Tickets, Coupons, Analytics, Exports, etc.) | Admin Bar, GlassCard, Ctrl+K |
| `/auth` | Page (Static) | Passwordless magic link request + mandatory RFC 6238 TOTP | Admin Auth Card |
| `/_not-found` | Page (Static) | Admin 404 handler with noindex | Error Screen |

### 1.4 Contest Demo & Tabletop Shell (`apps/web` via FastAPI — Port 8000)
| Route / File | Type | Description & Primary Components | Target |
|---|---|---|---|
| `/?mock=1&judge=1` | HTML/JS | Live competition judge dashboard + elder screen | Judge Panel |
| `/index.html` | Static HTML | Root contest demo interface | Elder Tablet |
| `/guardian.html` | Static HTML | Standalone 5-step onboarding and enrollment demo | Caregiver View |
| `/demo.html` | Static HTML | Synthetic scam audio replay and stage progression | Video Demo |
| `/theme.css` | CSS | CoinCompass tokens (deep green, lime, 28px corners) | Shared Stylesheet |
| `/app.js` | JS | WebSocket client, audio worklet pipeline, DOM updates | Core Logic |
| `/guardian.js` | JS | Onboarding wizard and voice consent logic | Enrollment Logic |
| `/worklet.js` | AudioWorklet | 16 kHz PCM16 1024-byte audio framing + RMS silence gating | Audio Engine |

---

## 2. API Routes Inventory (`apps/api`)

### 2.1 Public & Guardian Endpoints (`/api/*` and Core)
| Method | Route | Auth / Protection | Purpose |
|---|---|---|---|
| `GET` | `/health` | Public | System liveness probe and mock status |
| `GET` | `/api/config` | Public | Brand settings (`BRAND_NAME`, `BRAND_DOMAIN`, `TICKET_PREFIX`) |
| `GET` | `/api/usage` | Public | Today's STT minutes used vs daily credit cap |
| `GET` | `/api/guardians` | Bearer Token | Authenticated guardian profile details |
| `GET` | `/api/elders` | Bearer Token | List protected elders in household |
| `POST` | `/api/elders` | Bearer Token | Enroll a new elder in household |
| `GET` | `/api/sessions` | Bearer Token | Session history for household |
| `GET` | `/api/events` | Bearer Token | Scam risk events and transcript excerpts |
| `GET` | `/api/alerts` | Bearer Token | Alert history with stage escalation level |
| `POST` | `/api/alerts/{id}/feedback` | Bearer Token | Caregiver feedback on detection accuracy |
| `GET` | `/alerts/{token}` | Signed URL Token | One-click public caregiver incident viewer |
| `POST` | `/api/intercom` | Bearer Token | Push-to-talk audio relay to elder tablet |
| `GET` | `/clips/{profile}/{filename}` | Public / Token | Serve synthesized familial warning audio |
| `POST` | `/api/voice/liveness-phrase` | Bearer Token | Generate randomized anti-replay liveness sentence |
| `POST` | `/api/voice/enroll` | Bearer Token | Submit consented voice sample for cloning |
| `GET` | `/api/voice/status` | Bearer Token | Check voice cloning readiness |
| `DELETE` | `/api/voice/profile` | Bearer Token | Instant purge of voice embedding and audio clips |
| `POST` | `/api/waitlist` | Rate Limited / Honeypot | Public early-access waitlist signup |
| `GET` | `/api/waitlist/confirm` | Signed Token | Double opt-in confirmation link |
| `GET` | `/api/waitlist/unsubscribe` | Signed Token | RFC 8058 one-click waitlist unsubscribe |
| `POST` | `/api/support` | Rate Limited | Public support request & scam emergency intake |
| `GET` | `/api/support/t/{token}` | Signed Token | Passwordless customer support portal |
| `POST` | `/api/support/t/{token}/reply` | Signed Token | Customer reply to open support ticket |
| `POST` | `/api/support/t/{token}/csat` | Signed Token | CSAT 1-5 rating on solved ticket |
| `GET` | `/api/help/articles` | Public | Published knowledge base articles |
| `POST` | `/api/coupons/validate` | Rate Limited | Validate promo code with 60% cap & GST math |
| `GET` | `/api/changelog/feed` | Public | JSON feed of product updates |
| `GET` | `/api/changelog/rss` | Public | RSS 2.0 XML feed of product updates |
| `GET` | `/api/neon/status` | Public | Live telemetry for Neon Postgres, Auth & Gateway |

### 2.2 Operations Console Endpoints (`/admin-api/*`)
| Method | Route | Security Gate | Purpose |
|---|---|---|---|
| `POST` | `/admin-api/auth/magic-link` | `ADMIN_ENABLED=1`, Origin | Request passwordless login link via SMTP |
| `POST` | `/admin-api/auth/verify-magic-link`| `ADMIN_ENABLED=1`, Origin | Verify single-use 10-min magic link |
| `POST` | `/admin-api/auth/verify-totp` | `ADMIN_ENABLED=1`, Origin | Complete login with RFC 6238 TOTP |
| `POST` | `/admin-api/auth/step-up` | Session Cookie + TOTP | Elevate session privilege for 5 minutes |
| `POST` | `/admin-api/auth/reveal-pii` | Session Cookie + Step-Up | Audited operational reveal of masked PII |
| `GET` | `/admin-api/auth/me` | Session Cookie | Current admin identity and permissions |
| `POST` | `/admin-api/auth/logout` | Session Cookie | Invalidate admin session cookie |
| `GET` | `/admin-api/waitlist` | Admin Session | Filterable CRM waitlist entries |
| `POST` | `/admin-api/waitlist/invite` | Admin Session | Generate single-use beta invite code |
| `POST` | `/admin-api/waitlist/campaigns` | Admin Session + Step-Up | Dispatch throttled email campaign to cohort |
| `GET` | `/admin-api/tickets` | Admin Session | Filterable support inbox with SLA timers |
| `GET` | `/admin-api/tickets/{id}` | Admin Session | Full ticket thread with internal notes |
| `POST` | `/admin-api/tickets/{id}/reply` | Admin Session | Post public reply or private staff note |
| `POST` | `/admin-api/tickets/{id}/status`| Admin Session | Update ticket status (solved, pending, etc.) |
| `GET` | `/admin-api/kb/articles` | Admin Session | Manage knowledge base articles |
| `POST` | `/admin-api/kb/articles` | Admin Session | Create/update KB article |
| `GET` | `/admin-api/coupons` | Admin Session | Active, expired, and redeemed promo codes |
| `POST` | `/admin-api/coupons` | Admin Session + Step-Up | Create or bulk-generate coupon codes |
| `GET` | `/admin-api/analytics/kpis` | Admin Session | Real-time rollups (households, calls, alerts) |
| `GET` | `/admin-api/analytics/timeseries`| Admin Session | 7/30/90 day historical trends |
| `GET` | `/admin-api/analytics/funnel` | Admin Session | 5-stage customer conversion funnel |
| `GET` | `/admin-api/analytics/costs` | Admin Session | Daily STT and infrastructure cost tracking |
| `POST` | `/admin-api/exports/jobs` | Admin Session + Step-Up | Request async CSV/XLSX/JSON/Print export |
| `GET` | `/admin-api/exports/jobs/{id}` | Admin Session | Poll export compilation progress |
| `GET` | `/admin-api/exports/jobs/{id}/download` | Admin Session | Secure streaming download of export file |
| `GET` | `/admin-api/households` | Admin Session | Fleet household & elder directory |
| `POST` | `/admin-api/households/{id}/status`| Admin Session + Step-Up | Suspend or restore household |
| `GET` | `/admin-api/devices` | Admin Session | Tabletop kiosk fleet heartbeat telemetry |
| `POST` | `/admin-api/devices/{id}/revoke`| Admin Session + Step-Up | Revoke compromised kiosk pairing |
| `GET` | `/admin-api/reviews` | Admin Session | False-alarm review triage queue |
| `POST` | `/admin-api/reviews/{id}/action`| Admin Session | Propose dictionary calibration rule |
| `GET` | `/admin-api/credits/ledger` | Admin Session | Account credit balance audit log |
| `POST` | `/admin-api/credits/adjust` | Admin Session + Step-Up | Adjust credit quota with 10-min cooldown |
| `GET` | `/admin-api/flags` | Admin Session | Dynamic runtime feature flags |
| `POST` | `/admin-api/flags/{key}` | Admin Session + Step-Up | Update feature flag value |
| `GET` | `/admin-api/data-rights` | Admin Session | DPDP statutory 30-day DSR queue |
| `POST` | `/admin-api/data-rights/{id}/process`| Admin Session + Step-Up | Fulfill data export or erase request |
| `GET` | `/admin-api/audit` | Admin Session | Append-only tamper-resistant audit log |
| `GET` | `/admin-api/audit/verify` | Admin Session | Cryptographic SHA-256 chain verification |
| `GET` | `/admin-api/email/outbox` | Admin Session | Inspect pending and delivered outbox queue |
| `POST` | `/admin-api/email/test-send` | Admin Session + Step-Up | Trigger diagnostic test email |

### 2.3 Streaming WebSockets
| Protocol | Route | Purpose |
|---|---|---|
| `WSS` | `/ws/session` | Full-duplex real-time audio stream (PCM16 1024-byte frames), mock/live STT, stage risk telemetry |
| `WSS` | `/ws/intercom` | Real-time push-to-talk audio relay between guardian and elder tabletop device |

---

## 3. Email Templates & Localization Matrix

| Template Identifier | Locales Supported | Trigger Event | Key Variables | Unsubscribe Link? |
|---|---|---|---|---|
| `admin_login_link` | `en` | Admin enters allowed email | `{login_link}`, `{expires_in_minutes}`, `{brand_name}` | No (Transactional) |
| `waitlist_confirm` | `en`, `hi`, `gu` | User submits public waitlist form | `{name}`, `{confirm_url}`, `{brand_name}` | Yes (RFC 8058) |
| `waitlist_welcome` | `en` | User clicks confirmation link | `{name}`, `{rank}`, `{brand_name}` | Yes (RFC 8058) |
| `beta_invite` | `en` | Admin invites confirmed cohort | `{name}`, `{invite_code}`, `{onboard_url}`, `{coupon_code}` | Yes (RFC 8058) |
| `ticket_received` | `en` | User submits support request | `{name}`, `{ticket_number}`, `{subject_clean}`, `{portal_url}`, `{sla_hours}` | No (Transactional) |
| `ticket_reply` | `en` | Staff posts public reply | `{name}`, `{ticket_number}`, `{agent_name}`, `{reply_body}`, `{portal_url}` | No (Transactional) |
| `ticket_solved_csat` | `en` | Ticket marked solved | `{name}`, `{ticket_number}`, `{portal_url}` | No (Transactional) |
| `coupon_gift` | `en` | Gift or sponsorship voucher sent | `{name}`, `{coupon_code}`, `{discount_description}`, `{pricing_url}` | Yes (RFC 8058) |
| `broadcast_base` | `en` | Marketing campaign broadcast | `{subject_title}`, `{body_html}`, `{unsubscribe_url}` | Yes (RFC 8058) |

---

## 4. Background Jobs & Daemons

| Job Name | Implementation | Trigger / Cadence | Safety / Retention Guard |
|---|---|---|---|
| **Event Excerpt Purge** | `app.db:purge_old_events()` | Server startup (lifespan) & daily cron | Permanently purges transcript excerpts older than 7 days |
| **Email Outbox Dispatcher** | `app.email.sender:process_outbox()` | On-demand + 30s background cycle | Exponential backoff, daily volume cap (`EMAIL_DAILY_CAP`), rate limit per minute |
| **Device Health Watchdog** | `app.device_health:check_device_heartbeats()` | 30s heartbeat probe | 90s offline threshold; triggers caregiver Telegram alert |
| **Session Heartbeat Guard** | `app.session:SessionRunner` | WebSocket lifecycle | 3-minute silence timeout; 20-minute hard session cutoff |
| **Audit Hash Chain Verifier** | `app.audit:verify_audit_chain()` | Admin on-demand & scheduled probe | Verifies SHA-256 rolling digest across all audit events |

---

## 5. Forms & Interactive Modals

### 5.1 Public & Customer Forms
1. **Public Waitlist Intake Form** (`apps/site` landing & `/pricing`):
   - Fields: `name`, `email`, `phone` (optional), `city`, `language`, `elder_age_bracket`, `heard_from`, `hp_confirm` (honeypot).
   - Validations: Email regex, honeypot must be empty, IP rate limit.
2. **Support Ticket Intake Form** (`apps/site/src/app/contact` & `/help`):
   - Fields: `name`, `email`, `category` (`scam_emergency`, `device_hardware`, `billing`, `other`), `subject`, `description`, `phone`.
   - Behavior: Emergency category triggers automated P0 SLA escalation.
3. **Customer Support Portal Reply** (`/api/support/t/{token}`):
   - Fields: `reply_text`, optional attachments.
4. **Coupon Validation Input** (`apps/site/src/app/pricing` & `@kavach/app` `/billing`):
   - Fields: `code`.
   - Math: Integer paise calculation, 60% maximum cap, 18% GST display.

### 5.2 Guardian App Forms
5. **Guardian Onboarding Wizard** (`@kavach/app` `/onboarding`):
   - Step 1: Household Name & Location.
   - Step 2: Elder Profile & Primary Languages.
   - Step 3: Elder Consent Agreement (explicit checkbox).
   - Step 4: Voice Cloning Consent & Randomized Challenge Audio Enrollment.
   - Step 5: Tabletop Device Pairing Code Generation.

### 5.3 Operations Console Forms & Modals
6. **Admin Login Magic Link Form** (`@kavach/admin` `/auth`):
   - Fields: `email`. Strict check against `ADMIN_ALLOWED_EMAILS`.
7. **Admin TOTP Verification Form** (`@kavach/admin` `/auth`):
   - Fields: `code` (6-digit RFC 6238 token).
8. **Step-Up Re-Authentication Modal** (`@kavach/admin`):
   - Triggered on high-privilege actions (campaign blast, coupon creation, household suspension, DSR erase).
   - Fields: `totp_code`. Grants 5-minute elevated ticket.
9. **Single-Use Beta Invite Modal** (`@kavach/admin` waitlist):
   - Fields: `email`, `coupon_code`.
10. **Coupon Creation Modal** (`@kavach/admin` coupons):
    - Fields: `code`, `discount_type` (`percent` / `fixed_paise`), `discount_value`, `max_redemptions`, `expires_at`.
11. **Command Palette (`Ctrl+K` / `Cmd+K`)** (`@kavach/admin`):
    - Instant keyboard-driven navigation across all 17 operations modules.

---

## 6. Export Center Capabilities

| Export Format | Engine | Security Protections | Typical File Naming |
|---|---|---|---|
| **CSV** | Python `csv.writer` | UTF-8 BOM (`\ufeff`) for Indic script; Formula injection defense (`'`, `+`, `-`, `=`, `@` prepended) | `kavach_export_{module}_{timestamp}.csv` |
| **XLSX** | `openpyxl` | Styled headers, auto-width columns, cell-type protection | `kavach_export_{module}_{timestamp}.xlsx` |
| **JSON** | `json.dumps` | Strict schema validation, PII masked unless step-up | `kavach_export_{module}_{timestamp}.json` |
| **Print HTML** | HTML template | Clean print stylesheet, page breaks, non-interactive audit snapshot | `kavach_report_{module}_{timestamp}.html` |

---

## 7. External Links Inventory

| External Target | URL | Context / Usage | Protocol |
|---|---|---|---|
| **National Cybercrime Portal** | `https://cybercrime.gov.in` | Support intake emergency banner, learn guides, landing FAQ | HTTPS |
| **National Helpline 1930** | `tel:1930` | Elder warning dialog, incident report, support emergency notice | TEL |
| **RBI Sachet Anti-Fraud Portal** | `https://sachet.rbi.org.in` | KYC and banking fraud educational guides | HTTPS |
| **Department of Telecommunications (Chakshu)** | `https://sancharsaathi.gov.in` | Telecom fraud reporting citations | HTTPS |
| **Gnani AI Platform Documentation** | `https://docs.gnani.ai` | STT and TTS engineering references | HTTPS |
| **Neon Serverless Postgres** | `https://neon.tech` | Database infrastructure telemetry | HTTPS |
| **GitHub Repository** | `https://github.com/pritpatel2412/Kavach` | Open-source code references, PRD, docs | HTTPS |

---

## 8. Spec Conformance Matrix

| Specification Area | Source Task / Spec | Expected Capability | Implemented Route / File | Conformance Status |
|---|---|---|---|---|
| **Marketing: Hero & Architecture** | Sprint F (F1) | CoinCompass theme, living-room audio topology, audio demo, claims | `apps/site/src/app/page.tsx` | **Implemented** |
| **Marketing: Pricing & Math** | Sprint F (F2) | Monthly/yearly toggle, INR plans, coupon input, GST 18% display | `apps/site/src/app/pricing/page.tsx` | **Implemented** |
| **Marketing: Educational Guides** | Sprint F (F3) | 3 deep-dive scam taxonomy guides (Digital Arrest, Parcel, KYC) | `apps/site/src/app/learn/*` | **Implemented** |
| **Trust & Legal Suite** | Sprint F (F4) | Privacy, Terms, Security, Grievance, Acceptable Use, DPDP notices | `apps/site/src/app/(legal)/*` | **Implemented** |
| **Release Feeds** | Sprint F (F5) | Static changelog, JSON feed, and RSS 2.0 XML feed | `apps/site/src/app/changelog/*` | **Implemented** |
| **Guardian App: Onboarding Wizard** | Sprint F (F6) | 5-step onboarding, explicit consent, voice cloning challenge | `apps/app/src/app/onboarding/page.tsx` | **Implemented** |
| **Guardian App: Dashboard & Alerts** | Sprint F (F7) | Household telemetry, incident drilldown, intercom push-to-talk | `apps/app/src/app/page.tsx`, `alerts/[id]` | **Implemented** |
| **Elder Kiosk Interface** | Sprint F (F8) | Large high-contrast kiosk, armed pulse wave, panic stop | `apps/app/src/app/elder/page.tsx`, `apps/web/` | **Implemented** |
| **Admin: Foundations & Auth** | Sprint A (A1) | Passwordless magic link + RFC 6238 TOTP, audit hash chain | `apps/api/app/admin_auth.py`, `apps/admin/` | **Implemented** |
| **Admin: Email Subsystem** | Sprint A (A2) | Localized outbox (en/hi/gu), DNS SPF/DKIM check, throttling | `apps/api/app/email/*` | **Implemented** |
| **Admin: Waitlist CRM** | Sprint A (A3) | Double opt-in, PII masking, single-use invite codes, campaigns | `apps/api/app/routes_waitlist.py` | **Implemented** |
| **Admin: Support Ticket System** | Sprint A (A4) | Public intake, customer magic portal, P0 scam emergency, CSAT | `apps/api/app/routes_support.py` | **Implemented** |
| **Admin: Coupons & Referrals** | Sprint A (A5) | 60% cap, integer paise GST math, 15-min atomic reservation | `apps/api/app/routes_coupons.py` | **Implemented** |
| **Admin: Visual Analytics** | Sprint A (A6) | Real SQL rollups, 5-stage funnel, demo dataset seeder | `apps/api/app/routes_analytics.py` | **Implemented** |
| **Admin: Central Export Center** | Sprint A (A7) | Multi-format CSV/XLSX/JSON/Print, formula injection defense | `apps/api/app/routes_export.py` | **Implemented** |
| **Admin: Operations Modules** | Sprint A (A8) | Households, tabletop fleet, false-alarm triage, feature flags | `apps/api/app/routes_modules.py` | **Implemented** |
| **Admin: Security & Deep Testing** | Sprint A (A9) | Origin validation, CSRF, step-up auth, 137 green offline tests | `apps/api/tests/test_admin_security_deep.py` | **Implemented** |
| **Contest Demo: Judge Panel** | Phase 1–4 | Mock speech replay, stage 1-5 escalation, judge mode telemetry | `apps/web/?mock=1&judge=1` | **Implemented** |
| **Contest Demo: Familial Voice** | Phase 3–4 | Consent-gated personalized warning synthesis + fallback | `apps/api/app/gnani/tts.py`, `assets/clips/` | **Implemented** |
| **Contest Demo: Telegram Alert** | Phase 4 | Instant webhook dispatch with transcript snippet and audio link | `apps/api/app/alerts.py` | **Implemented** |
| **Neon Cloud Infrastructure** | Neon Sprint | Serverless Postgres Lakebase, Managed Auth JWKS, AI Gateway | `packages/api-contract/src/neon.ts` | **Implemented** |
