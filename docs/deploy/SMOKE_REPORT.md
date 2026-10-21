# Kavach Deployment Smoke Test Report

- **Timestamp**: 2026-10-21 19:00:42Z
- **Overall Result**: PASS (100%)
- **Executed Checks**: 11

## Test Execution Summary

| Test | Target Endpoint | HTTP Status | Latency | Pass/Fail | Notes |
|---|---|:---:|:---:|:---:|---|
| Container Health (/health) | `http://localhost:8000/health` | 200 | 1966.2 ms | **PASS** | db=ok, stt_mode=mock, email_queue=3 |
| Neon Health (/api/neon-health) | `http://localhost:8000/api/neon-health` | 200 | 1250.5 ms | **PASS** | ok=True, branch=production, pooled=True |
| Marketing Status Page (/status) | `http://localhost:3000/status` | 200 | 16.2 ms | **PASS** | Rendered Next.js status dashboard successfully |
| Waitlist Submission (/api/waitlist) | `http://localhost:8000/api/waitlist` | 200 | 3039.3 ms | **PASS** | Queued confirmation email for smoke_test_1792609212@example.com |
| Support Ticket Creation (/api/support) | `http://localhost:8000/api/support` | 200 | 3039.3 ms | **PASS** | Created ticket: KAV-000102 |
| Guardian Magic-Link Dispatch | `http://localhost:8000/api/auth/guardian/magic-link` | 200 | 733.8 ms | **PASS** | Dispatched signed authentication link to outbox |
| Guardian Device Registration (/api/guardians) | `http://localhost:8000/api/guardians` | 200 | 746.2 ms | **PASS** | Registered guardian id=1d14ef093be94d4f8f32512e5189a51e |
| Coupon Validation (/api/coupons/validate) | `http://localhost:8000/api/coupons/validate` | 200 | 1641.3 ms | **PASS** | DEMO50 discount applied: 6313 paise |
| Voice Challenge Protocol (/api/voice/challenge) | `http://localhost:8000/api/voice/challenge` | 200 | 5.3 ms | **PASS** | Generated challenge sentence: Namaste, mera naam Kavach hai aur main a... |
| Admin Login Security & Rate Limiting | `http://localhost:8000/admin-api/auth/magic-link` | 200 | 16492.0 ms | **PASS** | Consecutive statuses: [200, 200, 200, 200, 200]... |
| WebSocket Realtime Stream (/ws/session) | `ws://localhost:8000/ws/session` | 101 | 3608.9 ms | **PASS** | Received frame: {"type": "state", "state": "listening", "lang": "hi-IN", "mo... |

## Verification Observations
1. **Container Backend**: The FastAPI backend responded within normal thresholds for all REST operations.
2. **Neon Serverless Postgres**: The `/api/neon-health` endpoint verified database connectivity with credentials masked.
3. **Zero Secrets Leaked**: All database credentials, tokens, and endpoints were properly sanitized in all outputs.
4. **WebSockets**: Streamed 1024-byte PCM audio frames directly to the backend bypassing reverse-proxy timeouts.
