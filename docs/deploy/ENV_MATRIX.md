# Kavach Environment Variables Matrix

This document provides a single reference table for all environment variables required across each deployed service and project.

---

## 1. Container Backend (Render / Railway / Docker)

| Variable Name | Required | Secret? | Default / Example Value | Description |
|---|:---:|:---:|---|---|
| `DEPLOY_MODE` | **Yes** | No | `production` (or `staging`) | Enables strict config validation guards on startup. |
| `DATABASE_URL` | **Yes** | **Yes** | `postgresql://user:pass@ep-host-pooler...neon.tech/neondb?sslmode=require` | Pooled connection string with PgBouncer for runtime transactions. |
| `DATABASE_URL_UNPOOLED`| **Yes** | **Yes** | `postgresql://user:pass@ep-host...neon.tech/neondb?sslmode=require` | Direct connection string without PgBouncer for DDL schema migrations. |
| `KAVACH_SECRET` | **Yes** | **Yes** | High-entropy 32+ char random string | HMAC signing secret for session cookies, magic links, and tokens. |
| `PUBLIC_URL` | **Yes** | No | `https://api.kavach.ai` | External HTTPS origin of this container service. |
| `PUBLIC_SITE_URL` | **Yes** | No | `https://kavach.ai` | External HTTPS origin of the main marketing/apex site. |
| `ADMIN_ORIGIN` | **Yes** | No | `https://admin.kavach.ai` (or `https://kavach.ai/admin`) | Trusted origin for Admin Console CSRF/CORS checks. |
| `EMAIL_MODE` | **Yes** | No | `smtp` | Enforces SMTP dispatch in staging/production. |
| `SMTP_HOST` | **Yes** | No | `smtp.sendgrid.net` (or `mailpit`) | SMTP server hostname. |
| `SMTP_PORT` | **Yes** | No | `587` (or `1025`) | SMTP server port. |
| `SMTP_USER` | **Yes** | **Yes** | `apikey` | SMTP authentication username. |
| `SMTP_PASS` | **Yes** | **Yes** | `SG.xxxxxxxxxxxxxxxx` | SMTP authentication password / API key. |
| `SMTP_FROM_EMAIL` | **Yes** | No | `alerts@kavach.ai` | Verified sender email address. |
| `SMTP_FROM_NAME` | No | No | `Kavach Guardian` | Sender display name. |
| `GNANI_API_KEY` | Optional | **Yes** | `vach_1ytE...` | Gnani API key (sent as `X-API-Key-ID`). If omitted, auto-falls back to mock STT. |
| `FEATURE_LIVE_STT` | No | No | `0` (or `1`) | Master kill switch for paid live STT transcription. |
| `GLOBAL_STT_MINUTES_PER_DAY` | No | No | `500.0` | Global fleet daily minute cap protecting Gnani credits. |
| `LIVE_STT_ALLOWLIST` | No | No | `owner@kavach.ai,tester@kavach.ai` | Comma-separated list of accounts authorized to consume live STT credits. |
| `TRUSTED_PROXY_HOPS` | No | No | `1` | Number of trusted reverse proxy hops for client IP extraction (`X-Forwarded-For`). |
| `ADMIN_ENABLED` | **Yes** | No | `1` | Activates `/admin-api/*` endpoints. |
| `ADMIN_ALLOWED_EMAILS`| **Yes** | No | `owner@kavach.ai,admin@kavach.ai` | Comma-separated allowlist of email addresses permitted to access Admin. |
| `TELEGRAM_BOT_TOKEN` | Optional | **Yes** | `123456:ABC-DEF...` | Telegram bot token for emergency dispatch. |
| `TELEGRAM_CHAT_ID` | Optional | No | `-100123456789` | Telegram chat ID for alert notifications. |
| `WEB_CONCURRENCY` | **Yes** | No | `1` | Enforces single-instance worker for in-memory session/intercom relay state. |

---

## 2. Vercel Project 1: `@kavach/site` (Root / Apex Router)

- **Root Directory**: `apps/site`
- **Framework Preset**: Next.js

| Variable Name | Required | Secret? | Production Value | Description |
|---|:---:|:---:|---|---|
| `NEXT_PUBLIC_BRAND_NAME` | **Yes** | No | `Kavach` | Global brand name. |
| `NEXT_PUBLIC_BRAND_DOMAIN` | **Yes** | No | `kavach.ai` | Primary apex domain. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | No | `https://kavach.ai/app` | Path or subdomain for the Guardian SaaS app. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | No | `https://kavach.ai` | Canonical website URL. |
| `NEXT_PUBLIC_ADMIN_URL` | **Yes** | No | `https://kavach.ai/admin` | Path or subdomain for Admin Console. |
| `NEXT_PUBLIC_MOCK` | **Yes** | No | `0` | Strictly `0` in production (fail-fast build guard). |
| `API_ORIGIN` | **Yes** | No | `https://api.kavach.ai` | Upstream container backend origin for `/api/:path*` rewrites. |
| `APP_PROJECT_ORIGIN` | **Yes** | No | `https://kavach-app.vercel.app` | Target Vercel project origin for `/app/:path*` multi-zone rewrites. |
| `ADMIN_PROJECT_ORIGIN` | **Yes** | No | `https://kavach-admin.vercel.app` | Target Vercel project origin for `/admin/:path*` multi-zone rewrites. |
| `DEMO_PROJECT_ORIGIN` | **Yes** | No | `https://kavach-demo.vercel.app` | Target Vercel project origin for `/demo/:path*` static demo rewrites. |
| `ALLOW_INDEXING` | No | No | `1` | Controls whether search engines are permitted to index the marketing site. |

---

## 3. Vercel Project 2: `@kavach/app` (Guardian SaaS & Elder Tablet)

- **Root Directory**: `apps/app`
- **Framework Preset**: Next.js

| Variable Name | Required | Secret? | Production Value | Description |
|---|:---:|:---:|---|---|
| `NEXT_PUBLIC_BRAND_NAME` | **Yes** | No | `Kavach` | Global brand name. |
| `NEXT_PUBLIC_BRAND_DOMAIN` | **Yes** | No | `kavach.ai` | Primary apex domain. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | No | `https://kavach.ai/app` | Current app URL. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | No | `https://kavach.ai` | Main website URL. |
| `NEXT_PUBLIC_MOCK` | **Yes** | No | `0` | Must be `0` in production. |
| `API_ORIGIN` | **Yes** | No | `https://api.kavach.ai` | Upstream backend origin for API requests. |
| `NEXT_PUBLIC_WS_URL` | **Yes** | No | `wss://api.kavach.ai` | Direct WebSocket origin (bypasses Vercel HTTP rewrites). |

---

## 4. Vercel Project 3: `@kavach/admin` (Admin Operations Console)

- **Root Directory**: `apps/admin`
- **Framework Preset**: Next.js

| Variable Name | Required | Secret? | Production Value | Description |
|---|:---:|:---:|---|---|
| `NEXT_PUBLIC_BRAND_NAME` | **Yes** | No | `Kavach` | Global brand name. |
| `NEXT_PUBLIC_BRAND_DOMAIN` | **Yes** | No | `kavach.ai` | Primary apex domain. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | No | `https://kavach.ai` | Main website URL. |
| `NEXT_PUBLIC_MOCK` | **Yes** | No | `0` | Must be `0` in production. |
| `API_ORIGIN` | **Yes** | No | `https://api.kavach.ai` | Upstream backend origin for `/admin-api/:path*`. |

---

## 5. Vercel Project 4: `@kavach/demo` (Static Contest Demo)

- **Root Directory**: `apps/web`
- **Framework Preset**: Other (Static HTML/JS)

| Variable Name | Required | Secret? | Production Value | Description |
|---|:---:|:---:|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | No | `https://api.kavach.ai` | Backend origin for static demo calls. |
| `NEXT_PUBLIC_WS_URL` | **Yes** | No | `wss://api.kavach.ai` | Direct WebSocket origin for live STT audio stream. |
