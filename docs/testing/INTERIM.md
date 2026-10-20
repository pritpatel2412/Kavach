# Interim Test Report: Sprint T — Kavach Full-System Test Campaign

**Date:** 2026-10-19  
**Campaign Lead:** Senior Test Architect / QA Lead  
**Test Harness Status:** 5/5 Services Running & Healthy (`FastAPI:8000`, `Site:3000`, `App:3001`, `Admin:3002`, `SMTP:1025`)  
**Scope Covered So Far:** T0 (Discovery & Planning), L14 (Regression & Baseline), L1 (Smoke & Matrix), L2 (Navigation & Link Graph), L3 (Functional End-to-End).

---

## 1. Executive Summary

The Kavach system has undergone initial test layers under strict black-box / tester constraints. Zero product code in `apps/*` or `packages/*` has been modified. The offline test harness is executing cleanly with zero paid Gnani AI credits consumed (`KAVACH_MOCK_STT=1`).

- **Total Tests Executed So Far:** 241 individual test executions across L14, L1, L2, and L3.
- **Pass Rate:** **95.4%** (230 passed, 11 failed / defects identified).
- **Flakiness (3x Repeat Runs):** **0% flaky tests**; high determinism confirmed across core e2e business flows.
- **Critical Defects:** 1 S1 Major defect (Support portal magic link path), 2 S2 Minor defects (SQL column typo in demo seeder, broken GitHub repo link), and 4 S3 Cosmetic defects.

---

## 2. Top Defects Discovered (Ledger Excerpt)

| ID | Severity | Area | Summary | Impact | Suspected Root Cause & Suggested Fix |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **D-001** | **S2** | CLI / Seeder | `sqlite3.OperationalError: no such column: email` when running seeder with `--clean`. | Prevents clean database reset in demo environments. | `scripts/seed_demo_data.py:63` executes `DELETE FROM tickets WHERE email = ...` but the column is `requester_email`. Fix: update column name. |
| **D-002** | **S3** | Web Demo | Judge panel and call replay overflow mobile viewports (`375px`) by 120px+. | Horizontal scrolling and broken layout on mobile judge inspection. | Fixed-width tables and button clusters in `apps/web/?mock=1&judge=1`. Fix: wrap in responsive `overflow-x-auto` container. |
| **D-003** | **S3** | Web Demo | Unauthenticated `GET /api/elders` triggers 401 console error on initial demo boot. | Ugly console log in judge demo mode. | `apps/web/app.js` calls `loadElders()` unconditionally on DOM load before mock tokens are loaded. Fix: gate behind auth or mock flag. |
| **D-004** | **S3** | Frontend | Next.js admin (`:3002`) and app (`:3001`) log 404 for `/favicon.ico`. | Minor console noise on all browser requests. | Apps lack `public/` directory and `favicon.ico` asset. Fix: add favicon to both Next.js applications. |
| **D-005** | **S2** | Marketing | Footer GitHub link points to 404 `https://github.com/pritp/kavach`. | External navigation failure for judges and users inspecting source code. | `SiteFooter.tsx` hardcodes personal username instead of repository owner `pritpatel2412/Kavach`. Fix: update URL. |
| **D-006** | **S3** | Marketing | Landing page nav link `#how-it-works` has no matching anchor tag on page. | Navigation button clicks do not scroll to section. | Landing nav uses `#how-it-works` but target element lacks id or exists at `/how-it-works`. Fix: link to `/how-it-works`. |
| **D-007** | **S1** | Support Portal | Magic link in `routes_support.py:208` produces `{s.public_url}/support/t/{token}`, missing `/api` prefix. | Customer magic link in confirmation email results in 404 on API router. | Route is registered as `@public_support_router.get("/api/support/t/{token}")`. Fix: change URL prefix in email/payload generation. |

---

## 3. Interim Safety & Performance Assessment

1. **Deterministic Scam Detection:** Pytest baseline passed 139/139 tests in 133.78s. Multi-lingual eval achieved 100% clean recall and 0.0 false alarms over 400 ambient chunks, confirming detector rules are completely stable.
2. **Cryptographic Integrity:** The SHA-256 rolling audit chain in `apps/api/app/audit.py` successfully validated across all write operations. Tamper-evident logging is operational.
3. **Rate Limiting & Abuse Defense:** The sliding-window IP rate limiter successfully throttled 12 out of 50 concurrent coupon application requests with HTTP 429 Too Many Requests, proving anti-abuse protection is active.
4. **Honeypot Bot Trapping:** Waitlist honeypot traps bot entries without persisting them or alerting the spammer.

---

## 4. Next Test Phases
The test campaign continues immediately into:
- **L4:** Realtime & Resilience (WebSocket binary/JSON framing, silence gating, connection drop resilience)
- **L5:** Form & Input Robustness (XSS, SQLi, Indic Unicode scripts, boundary testing)
- **L6:** Accessibility & Inclusion (Axe-core scan, keyboard tab order, 200% zoom)
- **L7-L13:** Security sweep, Data retention / DPDP compliance, Claims validation, Email RFC 8058 compliance, and CoinCompass UI Theme adherence.
