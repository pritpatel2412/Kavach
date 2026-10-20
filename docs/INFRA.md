# Kavach Cloud Infrastructure & Neon Integration Architecture

> **Document Version:** 1.0.0 · **Date:** 20 Oct 2026 · **Sprint:** X (Blockers, Truth, and Contest-Critical)  
> **Source of Truth:** AGENTS.md, docs/ARCHITECTURE.md, docs/SAFETY.md, docs/CLAIMS.md  
> **Security Invariant:** Zero raw audio or transcript data leaves the local device without explicit consent; no personal data reaches third-party AI gateways.

---

## 1. Executive Summary & Topology

Kavach employs a **hybrid edge-and-cloud architecture**:
- **Edge Kiosk Listener (Local Device):** Runs on the elder's tabletop device (e.g., tablet or Raspberry Pi). Real-time speech-to-text (Gnani Prisma STT) and rule-based scam detection (14 scam families, 5 escalation stages) execute strictly with client-side VAD silence gating. Raw microphone audio is never written to disk or sent to cloud analytics.
- **Local Edge Persistence (SQLite):** Fast, zero-network transactional persistence on the edge for high-speed offline operation during network flakiness.
- **Central SaaS Cloud (Neon Serverless PostgreSQL):** Cloud operational store for multi-household fleet health, support tickets, billing state, and audit logs.

```
+-------------------------------------------------------------------------------+
|                             EDGE DEVICE (ELDER KIOSK)                        |
|  Mic -> AudioWorklet (16kHz PCM) -> VAD Gating -> Gnani Prisma WebSocket     |
|                                         |                                     |
|                       kavach_detector (Python/JS Engine)                     |
|                                         |                                     |
|                                 SQLite Edge DB                                |
+-------------------------------------------------------------------------------+
                                         | (Aggregated telemetry & incident alerts only)
                                         v
+-------------------------------------------------------------------------------+
|                            CLOUD SAAS (FASTAPI / NEON)                        |
|                                                                               |
|   [Neon Lakebase Postgres]          [Neon Auth / JWKS]    [Neon AI Gateway]  |
|   Region: AWS ap-southeast-1        OAuth & Session Keys   Status: DEFAULT OFF|
|   Data: Fleet / Tickets / Billing   No PII Stored          Consent Gated: YES |
|   Zero Audio / Zero Transcripts                            Zero Audio Routed  |
+-------------------------------------------------------------------------------+
```

---

## 2. Neon Cloud Services Audit

### 2.1 Neon Serverless PostgreSQL (Lakebase)
- **Region:** AWS Asia Pacific (Singapore, `ap-southeast-1`).
- **Connection Model:** Dual-mode connection pooling:
  - Pooled endpoint (`-pooler.ap-southeast-1.neon.tech:5432`) for serverless FastAPI web workers.
  - Direct endpoint (`ep-*.ap-southeast-1.neon.tech:5432`) for migrations and administrative tasks.
- **Data Model & Classification:**
  - **Permitted Data:** Aggregated incident telemetry (stage counts, timestamp, threat level, duration), support ticket records, coupon redemption ledger, billing subscriptions, and device fleet heartbeats.
  - **Prohibited Data:** Raw audio streams, voice cloning biometrics (stored locally on device only), and unmasked Aadhaar/PAN or bank credentials.
  - **Portability:** All 12 schema migrations (`apps/api/migrations/*.sql`) are authored in ANSI SQL compatible with both SQLite 3.35+ and PostgreSQL 15+.

### 2.2 Neon Managed Auth
- **Endpoint:** `NEON_AUTH_BASE_URL` with public key verification via `NEON_AUTH_JWKS_URL`.
- **Function:** Key rotation and cryptographic signature verification for administrative and guardian sessions.
- **Privacy Boundary:** Authentication tokens contain only opaque user identifiers (`sub`) and role claims; no phone numbers or elder details are stored in auth tokens.

### 2.3 Neon AI Gateway (Privacy & Safety Boundary)
- **Status:** **DEFAULT OFF** and **STRICTLY CONSENT-GATED**.
- **Can any transcript or personal data reach the AI Gateway?**  
  **ABSOLUTELY NOT.** The detector engine (`kavach_detector`) is 100% deterministic, rule-based, and offline. It does not use LLMs for live call classification.
- **Consent Gating:** In optional administrative analysis (e.g. support ticket summarization or drafting support responses), the AI Gateway is invoked only when:
  1. The guardian or administrator explicitly toggles AI assistance.
  2. All PII (names, phone numbers, addresses, account numbers) is stripped using client-side regex masking before dispatch.
  3. No raw audio or real-time call transcript ever enters this pathway.
- **Contest Compliance:** Free-tier demo operations run completely without the AI Gateway, ensuring zero paid API token expenditures.

---

## 3. Health & Diagnostics Security (`/api/neon-health`)

The health endpoint (`GET /api/neon-health` or `GET /api/neon/status`) reports connectivity latency and operational status while enforcing strict secret protection:
- **No Credentials Exposed:** Database URLs, passwords, API tokens, and connection strings are masked at the service boundary.
- **Masking Filter:** `_sanitize_error()` strips credentials from any underlying database driver exception before serializing into JSON.
- **Robots / Crawlers:** Administrative and infrastructure endpoints return `X-Robots-Tag: noindex, nofollow` to prevent search engine indexing.

---

## 4. Database Portability Guidelines

When writing new migrations or queries:
1. Use standard ANSI SQL data types (`TEXT`, `INTEGER`, `REAL`).
2. Timestamps must be stored as ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`).
3. For upserts, use ANSI standard `ON CONFLICT (...) DO UPDATE` supported by both modern SQLite and PostgreSQL.
4. Never rely on SQLite-specific rowids or Postgres-specific non-standard extensions.
