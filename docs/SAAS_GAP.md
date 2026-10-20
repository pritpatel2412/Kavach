# Kavach SaaS Backend Gap Audit & Implementation Specification

> **Document Version:** 1.0.0 · **Date:** 20 Oct 2026 · **Sprint:** X (Blockers, Truth, and Contest-Critical)  
> **Source of Truth:** AGENTS.md, docs/ARCHITECTURE.md, docs/PRD_SUMMARY.md, docs/SAFETY.md, docs/CLAIMS.md  
> **Rule Conformance:** Zero paid Gnani credits; no hardcoded secrets or real PII; synthetic test data only; non-disruptive to contest demo.

---

## 1. Executive Summary & SaaS Gap Matrix

This audit evaluates the 7 critical SaaS operational modules of Kavach against contest readiness, production reality, and student hackathon constraints. To protect contest deadlines and avoid unnecessary external infrastructure dependencies, we implement the minimum robust real backend required for guardian login, device pairing, and elder consent while explicitly deferring non-critical third-party integrations (SMS gateways, OAuth providers, passkeys, and payment aggregators).

| Module | Status | Primary File Paths | Current Reality & Implementation | Deferral / Contest Rationale |
|---|---|---|---|---|
| **1. Guardian Login** | **REAL** (Magic Link + Sessions) / **DEFERRED** (SMS OTP, Google OAuth, Passkeys) | `apps/api/app/guardian_auth.py`<br>`apps/api/app/routes_guardian_auth.py`<br>`apps/api/app/auth.py`<br>`apps/app/src/app/login/page.tsx` | Passwordless email magic-link auth re-using the hardened outbox and token machinery. Single-use 10-minute cryptographic tokens, session tokens (`gsess_...`), refresh token rotation (`gref_...`), idle (30m) & absolute (8h) timeouts, and cross-household isolation. | SMS OTP requires paid DLT registration and SMS gateways (Twilio/Gupshup). Google OAuth and WebAuthn Passkeys introduce third-party credential dependencies unnecessary for the contest demo. |
| **2. Device Pairing** | **REAL** (Single-Use Code -> Hashed Device Token) | `apps/api/app/routes_devices.py`<br>`apps/api/app/db.py`<br>`apps/web/app.js` | Guardian creates a 6-character single-use pairing code (`device_pairing_codes`, 15m TTL). Device redeems code at `POST /api/devices/pair`, receives a hashed device token (`kav_dev_...`), and links the elder's hardware kiosk. Replay prevention and audit logging enforced. | QR code / NFC camera scanning is handled on top of this single-use code protocol without requiring specialized hardware libraries. |
| **3. Elder Consent** | **REAL** (Immutable Consent Timestamp & Audit Record) | `apps/api/app/db.py`<br>`apps/api/app/routes_devices.py`<br>`apps/web/app.js` | Device pairing strictly requires `elder_consent=True`. Server records an immutable ISO timestamp `elder_consent_ts` in `paired_devices` on pairing. Pairing requests without explicit consent are rejected with HTTP 400 (`elder_consent_required`). | Audio consent voice recordings are managed separately in `voice_profiles` via consented liveness phrases. |
| **4. Family Invites** | **MOCKED** | `packages/api-contract/src/mockAdapter.ts`<br>`apps/app/src/app/settings/page.tsx` | Simulated invite links and role assignments (`Co-Guardian`, `Viewer`) in the frontend mock adapter. | Multi-guardian RBAC per household is non-critical for the primary single-guardian contest evaluation flow. |
| **5. Notification Settings** | **REAL** (Telegram webhook + DB preferences) / **MOCKED** (WhatsApp / Push) | `apps/api/app/alerts.py`<br>`apps/api/app/db.py`<br>`apps/app/src/app/settings/page.tsx` | Real Telegram webhook dispatch via `telegram_chat_id` stored in `guardians` table with HMAC action tokens (`alert_view`, `intercom`). Push/WhatsApp preferences simulated in frontend settings UI. | WhatsApp Business API requires Meta enterprise verification; APNs/FCM requires mobile app provisioning. |
| **6. Credits Purchase** | **REAL** (Daily STT Quotas & Math) / **MOCKED** (Top-Up Gateway) | `apps/api/app/plans_config.py`<br>`apps/api/app/routes_coupons.py`<br>`apps/api/app/db.py` | Accurate integer paise pricing, GST-inclusive base calculations, daily STT audio processing quotas (`daily_usage`), and coupon reservations. Quota top-ups are simulated in the admin console. | Live credit card billing for ad-hoc audio minutes is deferred to avoid live merchant charges during evaluation. |
| **7. Payments** | **MOCKED** (FakeProvider & Webhook Simulator) | `apps/api/app/payments.py`<br>`apps/api/app/routes_coupons.py`<br>`apps/site/src/app/pricing/page.tsx` | Production-grade `FakePaymentProvider` simulating checkout initiation, signature verification, and webhook handling (`order.paid`, `payment.failed`) with idempotency and transaction locks. | Live Razorpay / Stripe integrations require GSTIN merchant accounts and KYC approval; FakeProvider provides 100% testable API contract parity. |

---

## 2. Detailed Module Breakdown

### 2.1 Guardian Authentication & Session Management
- **Architecture:** Passwordless email magic-link authentication using SHA-256 hashed single-use tokens (10-minute TTL). Upon verification, the backend issues an opaque session token (`gsess_...`) and a refresh token (`gref_...`).
- **Refresh Token Rotation:** Every call to `POST /api/auth/guardian/refresh` immediately revokes the old refresh token and issues a new pair, neutralizing token leakage or replay attacks.
- **Session Lifecycles:**
  - Idle timeout: 30 minutes of inactivity.
  - Absolute timeout: 8 hours.
- **Rate Limiting & Lockout:** 5 consecutive failed attempts trigger a 15-minute lockout on the email and IP address.
- **Cross-Household Isolation:** Every guardian session is strictly bound to its own `guardian_id`. Calling `/api/elders`, `/api/sessions`, or `/api/devices` verifies ownership and rejects cross-household access with HTTP 403 Forbidden.

### 2.2 Device Pairing & Fleet Management
- **Code Generation:** Guardian requests a code via `POST /api/devices/pairing-code` specifying `elder_id`. The server validates that the elder belongs to the authenticated guardian and returns an uppercase 6-character code (15-minute TTL).
- **Exchange & Token Storage:** The kiosk device submits the code and confirmation of elder consent via `POST /api/devices/pair`. The backend invalidates the code (`used = 1`), generates a high-entropy bearer token (`kav_dev_...`), and stores only its SHA-256 hash in `paired_devices`.
- **Replay Protection:** Re-submitting an already used or expired pairing code immediately fails with HTTP 400.

### 2.3 Elder Consent Recording
- **Statutory Privacy Compliance:** Under DPDP (Digital Personal Data Protection Act, 2023), passive ambient listening requires documented, verifiable consent.
- **Enforcement:** Pairing cannot succeed without `elder_consent: true`. The backend permanently registers `elder_consent_ts` in `paired_devices` and records an immutable audit log entry.
- **Revocation:** Guardians can unlink devices at any time via `DELETE /api/devices/{device_id}`, which immediately revokes the device's authorization to stream audio or query status.

### 2.4 Deferred Components & Future Roadmap
1. **SMS OTP Gateway:** Deferred. Evaluated via email magic link.
2. **Social OAuth (Google/Apple):** Deferred. Direct passwordless email provides superior security without third-party tracking.
3. **Multi-Guardian Household Invites:** Simulated in UI; database foreign keys support multiple guardians per household in future migration 013.
4. **Live Merchant Gateway (Razorpay/Stripe):** Maintained on `FakeProvider` with full HMAC webhook parity and integer paise GST calculations.
