# Kavach Cloud Infrastructure & Systems Architecture

> **Document Version:** 2.0.0 · **Date:** 20 Oct 2026 · **Sprint:** Y ("Make every claim true")  
> **Source of Truth:** AGENTS.md, docs/ARCHITECTURE.md, docs/SAFETY.md, docs/CLAIMS.md  
> **Integrity Invariant:** Every architectural claim must match code reality. Zero unsupported promises.

---

## 1. System Topology & Data Flow

Kavach operates a client-server architecture with managed third-party speech AI and serverless cloud services:

```
+-----------------------------------------------------------------------------------+
|                         TABLETOP ELDER KIOSK (CLIENT BROWSER)                     |
|  - Tabletop tablet/phone runs AudioWorklet (16 kHz PCM 16-bit)                    |
|  - Listens only when incoming call is on speakerphone                             |
|  - Explicit Elder Consent: Tap on device records notice version (2026-10-elder-v1)|
+-----------------------------------------------------------------------------------+
                                         |
                       WebSocket Audio Stream (1024-byte frames)
                                         v
+-----------------------------------------------------------------------------------+
|                          KAVACH BACKEND SERVER (FASTAPI)                          |
|                                                                                   |
|  1. Audio Forwarding: Pipes raw PCM frames to Gnani Prisma STT WebSocket          |
|     (Audio retention per Gnani platform terms, to be confirmed)                   |
|                                                                                   |
|  2. Scam Detection Engine (kavach_detector):                                      |
|     - Runs directly on our server (pure Python, regex & deterministic scoring)     |
|     - Evaluates 5 scam stages (Authority, Accusation, Isolation, Urgency, Payment) |
|                                                                                   |
|  3. Voice Synthesis & Interventions:                                              |
|     - Consented guardian voice embeddings stored server-side in SQLite (AES-256)   |
|     - Permanent deletion supported via DELETE /api/guardians/{id}/voice           |
|                                                                                   |
|  4. Local Server Persistence (SQLite):                                            |
|     - Events, alerts, guardian tokens, device pairing tokens                      |
|     - Transcript excerpts capped at 160 chars; auto-purged after 7 days           |
+-----------------------------------------------------------------------------------+
             |                                                  |
             | Telemetry & Billing Sync                         | Speech Recognition
             v                                                  v
+------------------------------------------+    +-----------------------------------+
|     NEON SERVERLESS POSTGRESQL           |    |       GNANI.AI PLATFORM           |
|  Region: AWS Singapore (ap-southeast-1)  |    |  Location: India Central          |
|  Data: Accounts, Billing, Audit Ledger   |    |  Services: Prisma STT, Timbre TTS|
|  Zero Audio / Zero Transcripts Stored    |    |  Retention: Per Gnani terms (TBC) |
|                                          |    +-----------------------------------+
|  [Neon AI Gateway]                       |
|  Status: DEFAULT OFF                     |
|  Transcripts Routed: NONE (by default)   |
|  Consent-gated for optional admin ops    |
+------------------------------------------+
```

---

## 2. Privacy & Data Boundary Audit

### 2.1 Call Audio & Transcription Streaming
- **Audio Transit:** Audio captured by the browser worklet is streamed through the Kavach server directly to Gnani Prisma STT (`wss://api.vachana.ai/stt/v3/stream`) for real-time transcription.
- **Server Storage:** The Kavach server does not write raw incoming audio chunks to disk or object storage.
- **Third-Party Retention:** Audio data retention by Gnani is governed by Gnani platform terms of service (retention policy to be confirmed in writing).
- **Transcript Excerpts:** Only high-risk snippets (maximum 160 characters) surrounding detected scam trigger phrases are saved in the server's operational SQLite database for caregiver review, with an automated 7-day TTL purge.

### 2.2 Detector & Database Execution
- **Detection Engine:** The 5-stage deterministic detector (`kavach_detector`) executes **on our backend server**, not in third-party cloud LLMs.
- **Voice Embeddings:** Voice cloning embeddings and pre-rendered emergency warning audio clips are stored **server-side** on our backend server. Embeddings are encrypted at rest with AES-256 and can be permanently erased at any time by the guardian via `DELETE /api/guardians/{id}/voice`.
- **Operational Database:** The local operational store (SQLite) runs directly on the backend server.

### 2.3 Neon Serverless PostgreSQL
- **Hosting Region:** AWS Asia Pacific (Singapore, `ap-southeast-1`). Note: Unlike domestic Indian services, Neon cloud infrastructure is physically hosted in Singapore.
- **Data Scope:** Multi-household fleet heartbeats, support tickets, coupon redemption ledgers, billing subscriptions, and cryptographic audit logs.
- **Prohibited Data:** Zero raw call audio, zero call transcripts, and zero biometric voice embeddings are ever synced to Neon.

### 2.4 Neon AI Gateway
- **Status:** **DEFAULT OFF** and **STRICTLY CONSENT-GATED**.
- **Transcript Routing:** By default, **NO call transcripts or voice data are ever sent to the AI Gateway**.
- **Administrative Scope:** The AI Gateway is reserved exclusively for optional administrative text assistance (e.g., summarizing support ticket threads), requiring explicit admin opt-in and client-side PII masking. It is never in the live call detection path.

### 2.5 Elder Consent Protocol
- **Direct Consent Requirement:** Under our DPDP-oriented design, consent cannot be granted by a guardian checking a box on behalf of another adult.
- **Device Pairing:** When pairing a tabletop tablet (`POST /api/devices/pair`), the senior citizen must explicitly review the plain-language notice and tap to consent directly on that device screen.
- **Traceability:** The pairing payload records `elder_consent: true`, the exact ISO timestamp (`elder_consent_ts`), and the statutory notice version (`notice_version: "2026-10-elder-v1"`).

---

## 3. Portability & Migration Invariants

When writing new migrations or database queries:
1. Use standard ANSI SQL data types (`TEXT`, `INTEGER`, `REAL`).
2. Timestamps must be stored as ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`).
3. For upserts, use ANSI standard `ON CONFLICT (...) DO UPDATE` supported by both modern SQLite and PostgreSQL.
4. Never rely on SQLite-specific rowids or Postgres-specific non-standard extensions.
