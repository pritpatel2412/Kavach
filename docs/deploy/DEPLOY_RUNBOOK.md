# Kavach Complete Production Deployment Runbook

This runbook contains exact, copy-paste instructions for deploying the entire Kavach monorepo to Neon, Render/Railway, and Vercel, and provides the architectural answer on how to manage the whole platform from **one single live URL (`https://kavach.ai`)**.

---

## Part 1: How You Manage the Entire Project from One Live URL

### The Architecture: Apex Domain Multi-Zone Routing

You built the entire project in one monorepo containing multiple distinct applications:
1. **Marketing & Legal Site** (`apps/site` on Next.js 14)
2. **Guardian SaaS App & Elder Tablet** (`apps/app` on Next.js 14)
3. **Admin Operations Console** (`apps/admin` on Next.js 14)
4. **Static Contest Demo** (`apps/web` on Vanilla HTML/JS)
5. **Container Backend API & WebSockets** (`apps/api` on Python FastAPI)

Even though they are separate codebases, **your users and judges will only ever see one domain: `https://kavach.ai`**.

```
                           User Traffic to https://kavach.ai
                                          |
                                          v
                     +-----------------------------------------+
                     |        Vercel Root Project (@kavach/site)|
                     |            (Domain: kavach.ai)          |
                     +-----------------------------------------+
                                          |
        +------------------+--------------+-------------+------------------+
        | /                | /app/:path*  | /admin/:*   | /api/:path*      | /demo/:*
        v                  v              v             v                  v
  Marketing Pages     Guardian App   Admin Console   FastAPI Container  Static Demo
   (Local Pages)      (Multi-Zone)   (Multi-Zone)     (Proxy Rewrite)   (Multi-Zone)
```

### 1. How Path Rewrites Work
The Root Vercel Project (`apps/site`) acts as the **Smart Gateway**:
- When a user visits `https://kavach.ai` or `https://kavach.ai/pricing` $\rightarrow$ served directly by `apps/site`.
- When a caregiver visits `https://kavach.ai/app` or `https://kavach.ai/app/alerts/alt-1` $\rightarrow$ Next.js internally rewrites the request behind the scenes to the Guardian App project (`APP_PROJECT_ORIGIN/app/:path*`).
- When an operator visits `https://kavach.ai/admin` $\rightarrow$ internally rewrites to `ADMIN_PROJECT_ORIGIN/admin/:path*`.
- When the frontend issues `fetch('/api/...')` $\rightarrow$ internally rewrites to the container backend (`API_ORIGIN/api/:path*`).
- When a judge opens `https://kavach.ai/demo` $\rightarrow$ internally rewrites to `DEMO_PROJECT_ORIGIN/index.html`.

The user's browser URL bar **never changes domains** and never displays an ugly third-party subdomain or port.

### 2. Cookie & Authentication Sharing
- **Path-Scoping**: Session cookies for the Guardian app are set with `Path=/` (or `Path=/app`), `SameSite=Lax`, and `Secure=true`.
- Because all frontend apps sit under the same apex domain `https://kavach.ai`, **cross-site cookie restrictions (third-party cookie blocking) do not apply**.
- Admin console session cookies are strictly scoped to the admin origin with cryptographic CSRF verification.

### 3. How WebSockets Work (Bypassing Vercel HTTP Timeouts)
- Vercel serverless edge rewrites **do not support persistent WebSocket connections** (Vercel terminates HTTP requests after standard function timeout).
- Tabletop speakerphone streaming requires a continuous, low-latency 16 kHz audio connection (`/ws/session`).
- **Solution**: The browser connects directly to the container origin using `wss://api.kavach.ai/ws/session` (configured via `NEXT_PUBLIC_WS_URL`).
- All REST requests go through `https://kavach.ai/api/...` for clean vanity URLs, while real-time binary audio streams bypass the CDN and talk directly to the container backend in Singapore.

---

## Part 2: Step-by-Step Deployment Instructions

### Step 1: Database Setup (Neon PostgreSQL)

1. Log into your [Neon Console](https://console.neon.tech).
2. Create a new project:
   - **Name**: `kavach-production`
   - **Region**: `AWS ap-southeast-1` (Singapore — lowest latency to India).
   - **Postgres Version**: `16`
3. On the project dashboard:
   - Select the `production` branch.
   - Under **Connection Details**, ensure **Connection pooling** is toggled **ON**.
   - Copy the **Pooled connection string** (contains `-pooler`):
     ```
     postgresql://<user>:<password>@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
     *(This is your `DATABASE_URL`)*.
   - Toggle **Connection pooling** **OFF** and copy the **Direct connection string**:
     ```
     postgresql://<user>:<password>@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
     *(This is your `DATABASE_URL_UNPOOLED`)*.
4. Schema migrations are **automatic**: The container backend runs all idempotent migrations in `apps/api/migrations/` on startup.

---

### Step 2: Container Backend Deployment (Render or Railway)

You can deploy to either Render or Railway using the included `Dockerfile` and `render.yaml`.

#### Option A: Render (Singapore)
1. In your [Render Dashboard](https://dashboard.render.com), click **New +** $\rightarrow$ **Blueprint**.
2. Connect your GitHub repository (`pritpatel2412/Kavach`).
3. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `kavach-api`
   - **Region**: `singapore`
   - **Plan**: Starter (always-on, single instance)
   - **Docker Context**: `.`
4. In the Render Dashboard under **Environment Variables**, paste the secret values:
   - `DATABASE_URL`: *(your Neon pooled connection string)*
   - `DATABASE_URL_UNPOOLED`: *(your Neon unpooled connection string)*
   - `KAVACH_SECRET`: *(run `openssl rand -hex 32` to generate a secure secret)*
   - `GNANI_API_KEY`: *(your Gnani key from app.gnani.ai)*
   - `SMTP_USER`: `apikey`
   - `SMTP_PASS`: *(your SendGrid/Resend API key)*
5. Click **Apply**.
6. Once deployed, test health:
   ```bash
   curl https://kavach-api.onrender.com/health
   # Must return: {"ok":true,"db":"ok",...}
   ```

#### Option B: Railway (Alternative)
1. In [Railway](https://railway.app), click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select `Dockerfile` as the build method.
3. In **Settings** $\rightarrow$ **Deploy**:
   - Set **Region**: `ap-southeast-1` (Singapore).
   - Set **Restart Policy**: `Always`.
4. In **Variables**, add the same variables from `docs/deploy/ENV_MATRIX.md`.

---

### Step 3: Vercel Frontend Projects Setup (4 Projects)

In your [Vercel Dashboard](https://vercel.com):

#### Project 1: Root Marketing & Router (`apps/site`)
1. Click **Add New...** $\rightarrow$ **Project**.
2. Import `pritpatel2412/Kavach`.
3. Set **Project Name**: `kavach-site`.
4. Set **Root Directory**: `apps/site`.
5. Set **Environment Variables**:
   ```ini
   NEXT_PUBLIC_BRAND_NAME=Kavach
   NEXT_PUBLIC_BRAND_DOMAIN=kavach.ai
   NEXT_PUBLIC_SITE_URL=https://kavach.ai
   NEXT_PUBLIC_APP_URL=https://kavach.ai/app
   NEXT_PUBLIC_ADMIN_URL=https://kavach.ai/admin
   NEXT_PUBLIC_MOCK=0
   API_ORIGIN=https://api.kavach.ai
   APP_PROJECT_ORIGIN=https://kavach-app.vercel.app
   ADMIN_PROJECT_ORIGIN=https://kavach-admin.vercel.app
   DEMO_PROJECT_ORIGIN=https://kavach-demo.vercel.app
   ALLOW_INDEXING=1
   ```
6. Click **Deploy**.
7. In **Settings** $\rightarrow$ **Domains**:
   - Add `kavach.ai` (Apex domain)
   - Add `www.kavach.ai` (Redirect to apex)

#### Project 2: Guardian App & Elder Kiosk (`apps/app`)
1. Click **Add New...** $\rightarrow$ **Project** $\rightarrow$ Import `pritpatel2412/Kavach`.
2. Set **Project Name**: `kavach-app`.
3. Set **Root Directory**: `apps/app`.
4. Set **Environment Variables**:
   ```ini
   NEXT_PUBLIC_BRAND_NAME=Kavach
   NEXT_PUBLIC_BRAND_DOMAIN=kavach.ai
   NEXT_PUBLIC_SITE_URL=https://kavach.ai
   NEXT_PUBLIC_APP_URL=https://kavach.ai/app
   NEXT_PUBLIC_MOCK=0
   API_ORIGIN=https://api.kavach.ai
   NEXT_PUBLIC_WS_URL=wss://api.kavach.ai
   ```
5. Click **Deploy**.
6. The project will receive the internal domain `kavach-app.vercel.app` (which `apps/site` proxies to).

#### Project 3: Admin Operations Console (`apps/admin`)
1. Click **Add New...** $\rightarrow$ **Project** $\rightarrow$ Import `pritpatel2412/Kavach`.
2. Set **Project Name**: `kavach-admin`.
3. Set **Root Directory**: `apps/admin`.
4. Set **Environment Variables**:
   ```ini
   NEXT_PUBLIC_BRAND_NAME=Kavach
   NEXT_PUBLIC_BRAND_DOMAIN=kavach.ai
   NEXT_PUBLIC_SITE_URL=https://kavach.ai
   NEXT_PUBLIC_MOCK=0
   API_ORIGIN=https://api.kavach.ai
   ```
5. Click **Deploy**.
6. Project receives internal domain `kavach-admin.vercel.app`.

#### Project 4: Static Contest Demo (`apps/web`)
1. Click **Add New...** $\rightarrow$ **Project** $\rightarrow$ Import `pritpatel2412/Kavach`.
2. Set **Project Name**: `kavach-demo`.
3. Set **Root Directory**: `apps/web`.
4. Set **Framework Preset**: `Other`.
5. Set **Build Command**: `node ../../scripts/build_web_demo.js`
6. Set **Output Directory**: `.`
7. Set **Environment Variables**:
   ```ini
   NEXT_PUBLIC_API_URL=https://api.kavach.ai
   NEXT_PUBLIC_WS_URL=wss://api.kavach.ai
   ```
8. Click **Deploy**. Project receives `kavach-demo.vercel.app`.

---

### Step 4: DNS Records Configuration (Your Domain Registrar / Cloudflare)

In your DNS provider for `kavach.ai`:

| Type | Name | Content / Target | Purpose |
|:---:|:---:|---|---|
| `A` | `@` | `76.76.21.21` | Points apex domain to Vercel Root Project |
| `CNAME` | `www` | `cname.vercel-dns.com` | Redirects www to apex |
| `CNAME` | `api` | `kavach-api.onrender.com` | Points container backend to Render/Railway |
| `TXT` | `@` | `v=spf1 include:sendgrid.net ~all` | Authorizes outbound email sending |
| `CNAME` | `kavach._domainkey` | `kavach.domainkey.sendgrid.net` | DKIM email signature alignment |
| `TXT` | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:dmarc-reports@kavach.ai` | DMARC policy enforcement |

---

### Step 5: Post-Deployment Smoke Verification

Once DNS propagates (usually 2 to 5 minutes):
Run the automated live smoke verification against your live domain:

```bash
python scripts/smoke_live.py \
  --site-url "https://kavach.ai" \
  --app-url "https://kavach.ai/app" \
  --admin-url "https://kavach.ai/admin" \
  --api-url "https://api.kavach.ai" \
  --ws-url "wss://api.kavach.ai"
```

Verify that all 11 checks report `PASS` and inspect `docs/deploy/SMOKE_REPORT.md`.
