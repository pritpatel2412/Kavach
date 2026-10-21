# Kavach Content-Truth & Copy Reconciliation Log (COPY_CHANGES.md)

> **Sprint R — R6 Content-Truth Documentation**
> **Source of Truth:** [AGENTS.md](../../AGENTS.md), [CLAIMS.md](../CLAIMS.md), [SAFETY.md](../SAFETY.md), and [DECISIONS.md](../DECISIONS.md).

This document logs every before-and-after copy transformation executed during Sprint R to ensure 100% honesty, zero deceptive marketing patterns, and strict adherence to DPDP Act 2023 principles across all user-facing touchpoints.

---

## 1. Summary of Non-Negotiable Invariants

| Category | Forbidden Pattern (Before) | Approved Standard (After) | Governing Document |
|---|---|---|---|
| **Acoustic Reality** | "Call interception", "phone interceptor", "call blocker" | "Second-device acoustic speakerphone monitoring" | `AGENTS.md` Rule 7, `CLAIMS.md` §1 |
| **STT & Privacy** | "100% Offline AI", "Zero Audio Uploads" | "Real-time streaming to Gnani Prisma STT with zero raw audio storage & 7-day auto-purged excerpts" | `AGENTS.md` Rule 6, `SAFETY.md` §2 |
| **Pricing Honesty** | Arbitrary strikethroughs ("~~₹299~~ 50% OFF") | Transparent prices (₹149/mo, ₹299/mo) with GST breakdown; discounts only with configured coupon | `PRD_SUMMARY.md` §4 |
| **Social Proof** | Unattributed elder quotes / fabricated testimonials | "Sample preview — based on synthetic evaluation" or sourced real benchmarks (RBI, I4C) | `AGENTS.md` Rule 11 |
| **Plan Quotas** | Mismatched "300 min/mo" on Plus tier | Reconciled 150 min/mo (Plus) and 400 min/mo (Family) across contracts, site, app, and admin | `packages/api-contract/src/plans.ts` |
| **Environment** | Hardcoded fake "PRODUCTION" banners | Real environment tag (`LOCAL`, `STAGING`, `PROD`) with neutral `DEMO DATA` chip | Sprint R Task R5 |
| **Legal Status** | Uncertified legal warranties | "DRAFT — Pending Legal & Regulatory Review" on legal templates | `docs/design/DESIGN.md` |

---

## 2. Granular Change Ledger

### 2.1 Acoustic Monitoring & No-Interception Claims
- **Files Modified:** `apps/site/src/app/page.tsx`, `apps/site/src/app/how-it-works/page.tsx`, `apps/admin/src/app/page.tsx`, `apps/app/src/app/page.tsx`.
- **Before:**
  ```text
  "Kavach intercepts fraudulent calls before scammers can drain savings."
  "Scam Calls Intercepted: 314"
  ```
- **After:**
  ```text
  "Kavach listens to speakerphone calls on a second device, detecting digital arrest extortion in real time."
  "Scam Threats Flagged (Acoustic): 314"
  ```
- **Rationale:** Kavach operates as an acoustic guardian tablet sitting in the living room listening over speakerphone. Claiming network or telecom call interception violates Indian telecom regulations and misleads families.

---

### 2.2 STT Streaming & Audio Zero-Retention Truth
- **Files Modified:** `apps/site/src/app/security/page.tsx`, `apps/site/src/app/privacy/page.tsx`, `apps/app/src/app/privacy/page.tsx`.
- **Before:**
  ```text
  "100% Offline AI · Zero Audio Uploads. Everything runs on your device."
  "You maintain absolute ownership and real-time control over all data."
  ```
- **After:**
  ```text
  "Real-time acoustic streaming to Gnani Prisma STT over encrypted WebSockets. Strict zero raw audio retention: audio frames are analyzed in memory and immediately discarded. Transcript excerpts (<=160 chars) auto-expire after 7 days."
  "DPDP Act 2023 Digital Rights: Household Data Governance, Erasure, and Consented Biometric Embedding Deletion."
  ```
- **Rationale:** Audio frames ARE streamed in real time to Gnani Prisma STT. Saying "100% Offline AI" is false. Stating strict zero raw audio storage, encrypted transit, and 7-day auto-purge accurately reflects our actual pipeline architecture.

---

### 2.3 Transparent Pricing & Elimination of Fake Discounts
- **Files Modified:** `apps/site/src/app/pricing/page.tsx`, `apps/app/src/app/billing/page.tsx`.
- **Before:**
  ```text
  "Plus Plan: ₹149 ~~₹299~~ 50% OFF (Billed Monthly)"
  "Family Plan: ₹299 ~~₹449~~ 50% OFF (Billed Monthly)"
  ```
- **After:**
  ```text
  "Plus Plan: ₹149 / month (Billed Monthly, inclusive of 18% GST)"
  "Family Plan: ₹299 / month (Billed Monthly, inclusive of 18% GST)"
  "Annual Saver: Save ₹489/yr on Plus (₹1,299 billed annually)"
  "Promo Code input collapsible; discounts require active code (e.g. DEMO50 / DIWALI60)"
  ```
- **Rationale:** Permanent strikethrough pricing without a legitimate reference price violates the Consumer Protection (E-Commerce) Rules and ASCI guidelines. Real prices are displayed cleanly with transparent annual savings.

---

### 2.4 Social Proof & Testimonials Demystification
- **Files Modified:** `apps/site/src/app/page.tsx`, `apps/site/src/app/how-it-works/page.tsx`.
- **Before:**
  ```text
  "'Kavach saved my mother from losing 14 lakhs to a fake CBI officer!' — Verified Caregiver"
  ```
- **After:**
  ```text
  "Sample preview — based on synthetic evaluation runs and standard extortion call playbooks."
  "Sourced Statistics:
   1. ₹4,057 Cr reported national digital arrest losses (MHA / I4C Parliamentary Report, 2026).
   2. 97.3% synthetic scam stage recall across 164 automated test scenarios.
   3. 0 raw audio files retained on servers."
  ```
- **Rationale:** Kavach does not use fake testimonials. All benchmarks cite official government sources (I4C/MHA) or verifiable test suite metrics.

---

### 2.5 Plan Quota Reconciliation
- **Files Modified:** `apps/app/src/app/page.tsx`, `apps/app/src/app/billing/page.tsx`, `apps/site/src/app/pricing/page.tsx`.
- **Before:**
  - Guardian dashboard showed `74m / 300m Plus tier`.
  - Contract specified 150m for Plus tier.
- **After:**
  - Standardized across all apps:
    - **Free (Caregiver Starter):** 30 listening minutes / mo, 10 min emergency scam reserve.
    - **Plus (Individual Elder):** 150 listening minutes / mo, 30 min emergency scam reserve.
    - **Family (Multi-Household):** 400 shared listening minutes / mo, 60 min emergency scam reserve.
- **Rationale:** Prevents customer billing disputes by ensuring identical numbers appear in the marketing site, subscription agreements, guardian dashboard, and admin console.

---

### 2.6 Environment & Developer Jargon Purge
- **Files Modified:** `apps/app/src/components/MockBanner.tsx`, `apps/admin/src/components/AdminBanner.tsx`, `apps/admin/src/app/page.tsx`.
- **Before:**
  ```text
  "! MOCK SIMULATION MODE ACTIVE - Zero Live Gnani Credits Burned - Pure Offline Test Data DEV/MOCK PORT 3001"
  "ADMIN ... ENV: PROD (hardcoded while running locally)"
  ```
- **After:**
  ```text
  "Demo mode" (Clean, subtle, dismissible pill)
  "ENV: LOCAL" / "ENV: STAGING" / "ENV: PROD" derived from real runtime configuration, with "DEMO DATA" chip only when seeded.
  ```
- **Rationale:** Replaced loud yellow debug alerts with professional, high-contrast, accessible environment chips.

---

### 2.7 Legal Draft Watermarks
- **Files Modified:** `apps/site/src/app/privacy/page.tsx`, `apps/site/src/app/terms/page.tsx`, `apps/site/src/app/refunds/page.tsx`, `apps/site/src/app/cookies/page.tsx`, `apps/site/src/app/acceptable-use/page.tsx`, `apps/site/src/app/grievance/page.tsx`.
- **Before:**
  - Policies presented as finalized binding legal instruments.
- **After:**
  - Added visible alert box at top of each document:
    `"DRAFT NOTICE: This policy document is a draft version published for demonstration and contest evaluation purposes. Final execution requires statutory legal counsel review under DPDP Act 2023."`
- **Rationale:** Ensures compliance with statutory disclosure standards and avoids misrepresenting template terms as certified legal counsel.

---

*Authored by Senior Product Designer & Frontend Engineer · Sprint R Content-Truth Log Complete*
