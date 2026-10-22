# Kavach Deployment Smoke Test Report

- **Timestamp**: 2026-10-22 08:44:20Z
- **Overall Result**: PASS (100%)
- **Executed Checks**: 11

## Test Execution Summary

| Test | Target Endpoint | HTTP Status | Latency | Pass/Fail | Notes |
|---|---|:---:|:---:|:---:|---|
| Container Health (/health) | `https://kavach-api-1b1n.onrender.com/health` | 200 | 639.8 ms | **PASS** | db=ok, stt_mode=mock, email_queue=5 |
| Neon Health (/api/neon-health) | `https://kavach-api-1b1n.onrender.com/api/neon-health` | 200 | 171.3 ms | **PASS** | ok=True, branch=production, pooled=True |
| Marketing Status Page (/status) | `https://kavach-site.vercel.app/status` | 200 | 1037.4 ms | **PASS** | Rendered Next.js status dashboard successfully |
| Waitlist Submission (/api/waitlist) | `https://kavach-api-1b1n.onrender.com/api/waitlist` | 200 | 359.4 ms | **PASS** | Queued confirmation email for smoke_test_1792658656@example.com |
| Support Ticket Creation (/api/support) | `https://kavach-api-1b1n.onrender.com/api/support` | 200 | 298.7 ms | **PASS** | Created ticket: KAV-000103 |
| Guardian Magic-Link Dispatch | `https://kavach-api-1b1n.onrender.com/api/auth/guardian/magic-link` | 200 | 163.2 ms | **PASS** | Dispatched signed authentication link to outbox |
| Guardian Device Registration (/api/guardians) | `https://kavach-api-1b1n.onrender.com/api/guardians` | 200 | 177.7 ms | **PASS** | Registered guardian id=fba186a67acd4fe986946ba7308f87c3 |
| Coupon Validation (/api/coupons/validate) | `https://kavach-api-1b1n.onrender.com/api/coupons/validate` | 200 | 235.4 ms | **PASS** | DEMO50 discount applied: 6313 paise |
| Voice Challenge Protocol (/api/voice/challenge) | `https://kavach-api-1b1n.onrender.com/api/voice/challenge` | 200 | 213.9 ms | **PASS** | Generated challenge sentence: यह वाक्य मैं अपनी मर्ज़ी से पढ़ रहा हूँ ... |
| Admin Login Security & Rate Limiting | `https://kavach-api-1b1n.onrender.com/admin-api/auth/magic-link` | 200 | 1427.8 ms | **PASS** | Consecutive statuses: [200, 200, 200, 200, 200]... |
| WebSocket Realtime Stream (/ws/session) | `wss://kavach-api-1b1n.onrender.com/ws/session` | 101 | 969.7 ms | **PASS** | Received frame: {"type": "state", "state": "listening", "lang": "hi-IN", "mo... |

## Verification Observations
1. **Container Backend**: The FastAPI backend responded within normal thresholds for all REST operations.
2. **Neon Serverless Postgres**: The `/api/neon-health` endpoint verified database connectivity with credentials masked.
3. **Zero Secrets Leaked**: All database credentials, tokens, and endpoints were properly sanitized in all outputs.
4. **WebSockets**: Streamed 1024-byte PCM audio frames directly to the backend bypassing reverse-proxy timeouts.
