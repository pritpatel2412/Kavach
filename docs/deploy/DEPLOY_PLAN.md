# Kavach Production Deployment Architecture & Inventory Plan (DEPLOY_PLAN.md)

> **Sprint D — Task D0: Comprehensive Deployment & Systems Plan**  
> **Source of Truth:** [AGENTS.md](../../AGENTS.md), [STATUS.md](../../STATUS.md), [docs/INFRA.md](../INFRA.md), [docs/SAAS_GAP.md](../SAAS_GAP.md), [docs/CLAIMS.md](../CLAIMS.md), and [docs/design/COPY_CHANGES.md](../design/COPY_CHANGES.md).  
> **Security Invariant:** Zero secrets or passwords stored in code, logs, or prompts. Strict separation of public frontend parameters and confidential backend credentials.

---

## 1. Executive Deployment Topology

Kavach is designed to be hosted seamlessly across managed serverless and container infrastructure:

```
                                    +-------------------------------------------------------------+
                                    |                UNIFIED LIVE APEX DOMAIN                     |
                                    |                   https://kavach.ai                         |
                                    +-------------------------------------------------------------+
                                                                   |
                            +--------------------------------------+--------------------------------------+
                            |                                      |                                      |
                            v                                      v                                      v
       [Path: / & /learn & /pricing & /support]           [Path: /app & /elder]                  [Path: /admin]
             VERCEL PROJECT 1                                VERCEL PROJECT 2                  VERCEL PROJECT 3
       Marketing & Public Knowledge Hub               Guardian App & Tabletop Kiosk       Security Operations Console
             (`apps/site`)                                  (`apps/app`)                      (`apps/admin`)
                            |                                      |                                      |
                            +--------------------------------------+--------------------------------------+
                                                                   |
                                              Vercel Rewrites (/api/*) & Direct WSS (NEXT_PUBLIC_WS_URL)
                                                                   |
                                                                   v
                                    +-------------------------------------------------------------+
                                    |              BACKEND CONTAINER (RENDER / RAILWAY)           |
                                    |               FastAPI Python 3.12 (Single-Instance)         |
                                    |      - Realtime Call Pipeline & STT Frame Streaming         |
                                    |      - Scam Detection Engine (5-Stage Deterministic)        |
                                    |      - Async Intercom Relay & Two-Way WebSockets            |
                                    |      - In-Memory Excel/CSV Streaming (Zero Disk Leak)       |
                                    +-------------------------------------------------------------+
                                             |                                           |
                              PostgreSQL Pool (SSL Required)               Prisma STT WebSocket (PCM16)
                                             v                                           v
                            +----------------------------------+       +----------------------------------+
                            |     NEON SERVERLESS POSTGRES     |       |       GNANI.AI PLATFORM          |
                            |  Region: AWS Singapore (ap-se-1) |       |  Real-time STT & Voice Cloning   |
                            |  Branches: production & staging  |       |  Strict Credit Caps & Killswitch |
                            +----------------------------------+       +----------------------------------+
```

---

## 2. Complete Environment Variables Inventory

Every environment variable in the codebase has been identified, categorized, and assigned strict validation rules.

### 2.1 Backend Container & API (`apps/api`)

| Variable Name | Classification | Required? | Default (Local) | Production Staging Rule / Purpose |
|---|---|---|---|---|
| `DEPLOY_MODE` | Server Config | **Yes** | `local` | Enum: `local`, `demo`, `staging`, `production`. In `production`, mock adapters and demo seeds are strictly forbidden. |
| `DATABASE_URL` | **Secret** | **Yes** (in Staging/Prod) | `None` (falls back to SQLite) | Neon PostgreSQL connection string with PgBouncer connection pool (`-pooler.ap-southeast-1.aws.neon.tech`). SSL required (`sslmode=require`). |
| `DATABASE_URL_UNPOOLED` | **Secret** | **Yes** (in Staging/Prod) | `None` | Direct Neon PostgreSQL connection string (non-pooled) used exclusively for running DDL schema migrations on startup. |
| `NEON_BRANCH` | Server Config | No | `production` | Active Neon branch identifier (`production` or `staging`). |
| `KAVACH_SECRET` | **Secret** | **Yes** (in Staging/Prod) | `kavach_secret_key_2026_non_default` | Cryptographic key (min 32 bytes) used for signing session tokens (`gsess_...`), HMAC alert tokens, and TOTP step-up secrets. |
| `ALLOWED_ORIGINS` | Server Config | **Yes** | `""` | Comma-separated allowlist of origins permitted for CORS and WebSocket handshake (e.g. `https://kavach.ai,https://app.kavach.ai`). |
| `ADMIN_ENABLED` | Server Config | No | `1` in local, `0` in prod | Feature toggle for administrative endpoints (`/api/admin/*`). Must be explicitly set to `1` in hosted environments where admin is armed. |
| `ADMIN_ALLOWED_EMAILS` | **Secret** / Restricted | Conditional | `""` | Comma-separated list of pre-authorized administrator email addresses permitted to authenticate via TOTP / magic links. |
| `ADMIN_ORIGIN` | Server Config | No | `http://localhost:3002` | Trusted origin allowed to perform administrative step-up actions and export downloads. |
| `TRUSTED_PROXY_HOPS` | Server Config | No | `1` | Integer number of reverse proxy hops (e.g., Render/Railway + Cloudflare) to parse client IP from `X-Forwarded-For`. |
| `EMAIL_MODE` | Server Config | **Yes** | `console` in local, `smtp` in prod | Dispatch mode. In `staging` and `production`, must be `smtp`. Startup fails if set to `console` in production. |
| `SMTP_HOST` | Server Config | Conditional | `localhost` | Outbound transactional SMTP host (e.g., SendGrid, Postmark, AWS SES, Mailpit). |
| `SMTP_PORT` | Server Config | Conditional | `1025` (Mailpit/local) | Outbound SMTP port (`587` for STARTTLS, `465` for SSL, `1025` for local test catcher). |
| `SMTP_USER` | **Secret** | Conditional | `""` | SMTP authentication username. |
| `SMTP_PASS` | **Secret** | Conditional | `""` | SMTP authentication password/token. |
| `SMTP_STARTTLS` | Server Config | No | `0` | Boolean (`1`/`0`) whether to initiate TLS on connection. |
| `FROM_NAME` | Server Config | No | `Kavach Security` | Display name for transactional alert and invite emails. |
| `FROM_EMAIL` | Server Config | No | `notifications@kavach.ai` | Authenticated sender mailbox matching verified SPF/DKIM domain. |
| `REPLY_TO` | Server Config | No | `support@kavach.ai` | Customer reply destination mailbox. |
| `SITE_URL` / `PUBLIC_SITE_URL` | Public URL | **Yes** | `http://localhost:3000` | Canonical public URL of the marketing website. Used in email action links (unsubscribe, confirm). |
| `APP_URL` | Public URL | **Yes** | `http://localhost:3001` | Canonical public URL of the Guardian portal and Elder Kiosk. |
| `ADMIN_URL` | Public URL | **Yes** | `http://localhost:3002` | Canonical URL of the Security Operations console. |
| `GNANI_API_KEY` | **Secret** | Conditional | `""` | Paid speech API key for Gnani Prisma STT and Timbre TTS. Required only if live speech features are armed. |
| `FEATURE_LIVE_STT` | Cost Guard | No | `0` (Off) | Master kill switch for paid speech recognition. Default `0` ensures zero accidental credit burn. |
| `LIVE_STT_ALLOWLIST` | Cost Guard | No | `""` | Comma-separated list of guardian emails permitted to initiate live paid STT sessions. |
| `GLOBAL_STT_MINUTES_PER_DAY` | Cost Guard | No | `30.0` | Hard cap on total daily audio stream duration processed across all households. |
| `TELEGRAM_BOT_TOKEN` | **Secret** | No | `""` | Optional bot token for real-time Telegram caregiver alerts. |
| `TELEGRAM_CHAT_ID` | **Secret** | No | `""` | Default chat/channel ID for emergency broadcast alerts. |

---

### 2.2 Frontend Applications (`apps/site`, `apps/app`, `apps/admin`, `apps/web`)

| Variable Name | Project Scope | Classification | Required? | Default | Purpose |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | All Next.js Apps | Public | **Yes** | `local` | Informs UI shells of current runtime environment (`LOCAL`, `STAGING`, `PROD`). |
| `NEXT_PUBLIC_API_URL` | `apps/site`, `apps/app`, `apps/admin` | Public | **Yes** | `http://localhost:8000` | Target backend API origin for client fetches (or empty if using same-origin rewrites `/api/*`). |
| `NEXT_PUBLIC_WS_URL` | `apps/app`, `apps/web` | Public | **Yes** | `ws://localhost:8000/ws/call` | Direct WebSocket URL for audio streaming. Bypasses Vercel serverless rewrites. |
| `NEXT_PUBLIC_SITE_URL` | `apps/app`, `apps/admin` | Public | **Yes** | `http://localhost:3000` | Public website reference URL for footer links and statutory policies. |
| `NEXT_PUBLIC_APP_URL` | `apps/site` | Public | **Yes** | `http://localhost:3001` | Destination URL for "Guardian App" navigation buttons. |
| `NEXT_PUBLIC_MOCK` | All Frontends | Public | No | `0` (`1` in dev) | Forces frontend mock adapter. **Strictly rejected in production builds**. |
| `ALLOW_INDEXING` | `apps/site` | Public | No | `0` | If `1`, allows search engine crawlers (`robots.txt`). If `0`, sets `X-Robots-Tag: noindex`. |
| `NEXT_PUBLIC_BRAND_NAME` | `@kavach/api-contract` | Public | No | `Kavach` | Global brand name string. |
| `NEXT_PUBLIC_BRAND_DOMAIN` | `@kavach/api-contract` | Public | No | `kavach.ai` | Global brand domain string. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `@kavach/api-contract` | Public | No | `support@kavach.ai` | Customer grievance and support email. |

---

## 3. Hardcoded Localhost & URL Inventory

Audit of hardcoded hostnames and ports identified for parameterization:

| File Location | Hardcoded Value (Before) | Replacement Parameter | Action Taken in Sprint D |
|---|---|---|---|
| `apps/site/src/components/SiteHeader.tsx` | `http://localhost:3001` & `/auth` & `/elder` | `process.env.NEXT_PUBLIC_APP_URL` | Parameterized to dynamic env link with fallback. |
| `apps/site/src/components/SiteFooter.tsx` | `http://localhost:3001` | `process.env.NEXT_PUBLIC_APP_URL` | Parameterized to dynamic env link. |
| `apps/site/src/app/page.tsx` | `http://localhost:3001` | `process.env.NEXT_PUBLIC_APP_URL` | Parameterized to dynamic env link. |
| `apps/site/src/app/how-it-works/page.tsx` | `http://localhost:8000/?mock=1&judge=1` | `/demo` or `${NEXT_PUBLIC_API_URL}/?mock=1...` | Converted to path rewrite. |
| `apps/site/src/app/features/page.tsx` | `http://localhost:8000/?mock=1&judge=1` | `/demo` or `${NEXT_PUBLIC_API_URL}/?mock=1...` | Converted to path rewrite. |
| `apps/app/src/app/page.tsx` | `http://localhost:3000/consent-notice` | `${NEXT_PUBLIC_SITE_URL}/consent-notice` | Parameterized to dynamic site URL. |
| `apps/app/src/app/onboarding/page.tsx` | `localhost:3001/elder` (instruction text) | Dynamic origin: `${window.location.host}/elder` | Replaced static string with dynamic hostname. |
| `apps/app/src/app/auth/page.tsx` | `http://localhost:3000` | `${NEXT_PUBLIC_SITE_URL}` | Parameterized. |
| `apps/api/app/main.py` | Hardcoded local CORS origins | `ALLOWED_ORIGINS.split(",")` | Dynamic CORS configuration from environment. |
| `apps/api/app/admin_auth.py` | `{"http://localhost:3002", ...}` | `s.admin_origin` and `ADMIN_ALLOWED_ORIGINS` | Dynamic origin enforcement. |

---

## 4. Screen-by-Screen API & Data Source Mapping

Audit of every screen across all 4 frontend applications:

| Application | Screen / Route | Target Backend Endpoint | Current State | Production Wiring Requirement |
|---|---|---|---|---|
| **Marketing Site** (`apps/site`) | `/` (Home) | Static + Sourced Facts | Real Facts | Verified sourced stats; no live backend dependency. |
| | `/waitlist` | `POST /api/waitlist` | **Real API** | Validates email, enforces double opt-in, sends confirmation link. |
| | `/waitlist/confirmed` | `GET /api/waitlist/confirm` | **Real API** | Confirms token, awards queue rank. |
| | `/unsubscribe` | `POST /api/waitlist/unsubscribe` | **Real API** | Single-click RFC 8058 unsubscription. |
| | `/support` | `POST /api/support` | **Real API** | Customer ticket dispatch with auto-acknowledgment. |
| | `/support/t/[token]` | `GET /api/support/t/{token}`, `/reply`, `/csat` | **Real API** | Two-way ticket customer thread. |
| | `/pricing` | `POST /api/coupons/validate` | **Real API** | Validates coupon code and returns GST-inclusive arithmetic. |
| | `/status` | `GET /api/health` | **Real API** | Live backend health, database ping, and uptime status. |
| **Guardian App** (`apps/app`) | `/` (Dashboard) | `GET /api/sessions`, `GET /api/elders` | In-memory Mock | Wired to real API when authenticated; displays labeled **Sample data** in Demo Sandbox. |
| | `/auth` | `POST /api/auth/guardian/magic-link` | Mock `setTimeout` | Wired to real passwordless magic-link authentication. |
| | `/elder` | `wss://.../ws/call` | Mock simulation | Direct WebSocket connection to backend speech pipeline. |
| | `/billing` | `POST /api/payments/checkout` | FakeProvider | Real transaction flow against simulated provider in Test Mode. |
| | `/privacy` | `DELETE /api/guardians/{id}/voice`, `GET /export` | Mock handler | Wired to real biometric embedding purge and DSR data export. |
| | `/onboarding` | `POST /api/devices/pair` | Simulated code | Wired to single-use pairing code exchange and elder consent recorder. |
| **Admin Console** (`apps/admin`) | `/` (Overview) | `GET /api/admin/overview` | Hardcoded seed | Wired to live telemetry metrics and session counters. |
| | `/` (Waitlist CRM) | `GET /api/admin/waitlist`, `POST /invite` | Simulated table | Wired to live Neon CRM and invitation dispatcher. |
| | `/` (Support Inbox) | `GET /api/admin/support`, `POST /reply` | Simulated table | Wired to live ticket repository and SLA monitor. |
| | `/` (Coupons) | `POST /api/admin/coupons` | Simulated form | Wired to live coupon database with 60% discount ceiling. |
| | `/` (Export Center) | `GET /api/admin/export` | Local disk write | **Migrated to in-memory streaming response (StreamingResponse)**. |
| | `/` (Audit Log) | `GET /api/admin/audit` | Static entries | Wired to cryptographic SHA-256 hash chain ledger in Neon. |
| | `/auth` | `POST /api/admin/auth/verify` | Mock token | Wired to TOTP / emergency magic-link authentication. |
| **Static Demo** (`apps/web`) | `index.html` (Mock Kiosk) | `/ws/call` & `/api/config` | Real API | Direct connection to backend WebSocket server. |
| | `demo.html` (Contest Studio)| `/api/replays` & `/api/usage` | Real API | Real-time replay playback and synthetic judge evaluation. |

---

## 5. In-Memory State & Filesystem Writes Audit

### 5.1 In-Memory State & Single-Instance Constraint
- **Active Real-Time Audio Sessions:** Stored in Python memory as `CallPipeline` objects in `session.py`. Audio chunks are processed in real-time buffers.
- **WebSocket Connection Registry:** `active_connections` map in `intercom.py` for routing two-way audio between tablet and guardian phone.
- **Rate Limiting Buckets:** IP-based sliding window counters stored in memory (`rate_limiter.py`).
- **Architectural Consequence:** The backend container **must run as a single instance (`WEB_CONCURRENCY=1`, 1 replica)**. Horizontal scaling across multiple containers without a distributed Redis pub/sub layer would fragment WebSocket calls and intercom routing. This is documented as the **Single-Instance Constraint** in `render.yaml` and deployment specs.

### 5.2 Elimination of Ephemeral Filesystem Writes
In hosted serverless containers (Render/Railway), the local filesystem is ephemeral and reset upon container restarts. All filesystem dependencies are eliminated:
1. **SQLite Database (`data/kavach.db`):** Replaced with **Neon Serverless PostgreSQL** via `DATABASE_URL` in container production mode.
2. **Audio Warning Clips (`assets/clips/*.wav`):** Pre-rendered static warning audio files are baked directly into the Docker container image. Dynamically synthesized consented clips are stored as encrypted byte blobs in the database or streamed directly from memory.
3. **Spreadsheet Exports (`exports/*.xlsx`):** Migrated from `wb.save("exports/...")` on disk to **in-memory byte buffers (`io.BytesIO()`)** streamed via FastAPI `StreamingResponse` with appropriate MIME headers (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
4. **Temporary Attachments:** Streamed directly through Python email buffers without saving intermediate files to `/tmp`.

---

## 6. How to Manage the Entire System from ONE Live URL

To manage the entire monorepo from a single apex domain (`https://kavach.ai`), we deploy 4 Vercel projects and configure **Vercel Root Path Rewrites**:

### 6.1 Unified Path Routing Table

| Request Path | Routed Target | Architecture Implementation |
|---|---|---|
| `https://kavach.ai/` | Marketing Site | Primary Vercel Project (`apps/site`) deployed at root domain `kavach.ai`. |
| `https://kavach.ai/learn/*` | Educational Hub | Served directly by `apps/site`. |
| `https://kavach.ai/pricing` | Pricing Page | Served directly by `apps/site`. |
| `https://kavach.ai/support/*` | Customer Support | Served directly by `apps/site`. |
| `https://kavach.ai/app` | Guardian Portal | Vercel rewrite in `apps/site/vercel.json` pointing to `apps/app` deployment. |
| `https://kavach.ai/elder` | Tabletop Kiosk | Vercel rewrite in `apps/site/vercel.json` pointing to `apps/app/elder`. |
| `https://kavach.ai/admin/*` | Ops Console | Vercel rewrite in `apps/site/vercel.json` pointing to `apps/admin` deployment. |
| `https://kavach.ai/demo/*` | Mock Studio & Kiosk | Vercel rewrite pointing to `apps/web` static deployment. |
| `https://kavach.ai/api/*` | Backend API | Vercel rewrite proxying to backend container (`https://kavach-api.onrender.com/api/:path*`). |
| `wss://api.kavach.ai/ws/*` | Realtime WebSockets | Direct connection to backend container (WebSockets cannot be proxied over Vercel HTTP rewrites). |

### 6.2 Alternative: Subdomain Routing
If preferred over path rewrites, standard subdomains can be configured on the same root domain with unified wildcards:
- `https://kavach.ai` $\rightarrow$ Marketing Site
- `https://app.kavach.ai` $\rightarrow$ Guardian App & Elder Kiosk
- `https://admin.kavach.ai` $\rightarrow$ Admin Operations Console
- `https://api.kavach.ai` $\rightarrow$ Backend Container & Audio WebSockets

---

*Authored by Senior Product Designer & Systems Engineer · Sprint D Inventory & Plan Complete*
