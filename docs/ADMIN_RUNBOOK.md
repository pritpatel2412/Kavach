# Kavach Security Operations & Admin Console Runbook

This runbook defines operational standards, environment configuration, setup instructions, disaster recovery, and incident response procedures for the Kavach Security Operations Console.

---

## 1. Architecture & Security Model

Kavach separates administrative operations completely from the public marketing site and customer apps:

- **Isolated Admin UI Origin:**
  - **Local Development:** `http://localhost:3002` (Next.js 14 console)
  - **Staging / Production:** `https://admin.<BRAND_DOMAIN>` (e.g. `https://admin.kavach.ai`)
- **Dedicated Admin API Gateway:**
  - Mounted exclusively under `/admin-api` on the backend (`http://localhost:8000` / `https://api.<BRAND_DOMAIN>`).
  - Denies all anonymous traffic; requires `ADMIN_ENABLED=1` in environment.
  - Restricts CORS strictly to `ADMIN_ORIGIN`.
  - Sends `X-Robots-Tag: noindex, nofollow` to prevent search engine indexing.
  - Zero hyperlinks from public marketing pages to `/admin-api` or the admin console.
- **Zero Passwords & Hardware-Grade Authentication:**
  - No password fields exist in the database or UI.
  - Step 1: Passwordless single-use cryptographic magic link (10-minute expiry) dispatched via SMTP.
  - Step 2: Mandatory TOTP (RFC 6238 via `pyotp`) hardware token verification.
  - Step 3: High-risk mutations (unmasking PII, credit adjustments, refunds, bulk email campaigns, discount > 60%) require a fresh 5-minute step-up TOTP verification token.

---

## 2. Environment Variables Specification

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ADMIN_ENABLED` | Integer (`0` or `1`) | `0` | Master gate. When `0`, all `/admin-api` routes return `403 Forbidden`. |
| `ADMIN_ALLOWED_EMAILS` | String (comma-list) | `""` | Allowlist of authorized operator email addresses (e.g. `ops@kavach.ai,founder@kavach.ai`). |
| `ADMIN_SECRET_KEY` | String (hex/base64) | Generated | High-entropy key used for signing session cookies, magic links, and CSRF tokens. |
| `ADMIN_ORIGIN` | String (URL) | `http://localhost:3002` | Permitted origin for CORS and Host validation. |
| `BRAND_NAME` | String | `Kavach` | Single source of truth for platform brand identity across UI, emails, and alerts. |
| `BRAND_DOMAIN` | String | `kavach.ai` | Single source of truth for platform domain name and DNS configuration. |
| `TICKET_PREFIX` | String | `KAV` | Prefix for support ticket numbering (e.g. `KAV-000101`). |
| `EMAIL_MODE` | String | `console` | `console` prints rendered emails to server logs (dev); `smtp` dispatches via network. |
| `SMTP_HOST` | String | `localhost` | Outgoing SMTP server address. |
| `SMTP_PORT` | Integer | `1025` | Outgoing SMTP port (1025 for Mailpit, 587 for TLS). |
| `SMTP_USER` | String | `""` | SMTP authentication username. |
| `SMTP_PASS` | String | `""` | SMTP authentication password. Never commit this. |
| `SMTP_STARTTLS` | Boolean | `false` | Enable opportunistic TLS upgrade for port 587. |
| `FROM_NAME` | String | `Kavach Security` | Sender display name. |
| `FROM_EMAIL` | String | `security@kavach.ai` | Sender email address. |
| `REPLY_TO` | String | `support@kavach.ai` | Designated customer reply mailbox. |
| `EMAIL_RATE_PER_MIN` | Integer | `60` | Outbox worker rate throttle to prevent spam flag triggers. |
| `EMAIL_DAILY_CAP` | Integer | `5000` | Safety ceiling on total emails dispatched per 24 hours. |
| `PUBLIC_BASE_URL` | String | `http://localhost:8000` | Base URL used to construct signed unsubscribe and ticket links. |
| `AI_DRAFTS` | Integer (`0` or `1`) | `0` | Feature flag for AI support response assistance. Default 0. |

---

## 3. Local Development & Mailpit Setup

To test email delivery, double opt-in confirmation, and admin magic links without consuming live SMTP quotas or risking external delivery:

1. **Install and Run Mailpit (Catch-All SMTP Server):**
   ```bash
   # Via Docker
   docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit

   # Or via Scoop / Homebrew
   scoop install mailpit
   mailpit
   ```
2. **Configure Environment in `.env`:**
   ```ini
   EMAIL_MODE=smtp
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_USER=
   SMTP_PASS=
   SMTP_STARTTLS=false
   ```
3. Open `http://localhost:8025` in your browser to inspect all outgoing emails, multipart HTML renders, and test unsubscribe headers.

---

## 4. Admin Bootstrap & TOTP Enrollment

To enroll a new administrative operator:

1. **Run the Admin CLI:**
   ```bash
   python -m app.admin_cli bootstrap-totp ops@kavach.ai
   ```
2. **Output:**
   - The CLI outputs an encrypted TOTP secret and renders an ASCII QR code.
   - Scan the QR code using Google Authenticator, 1Password, or YubiKey Authenticator.
   - Ensure the operator's email is present in `ADMIN_ALLOWED_EMAILS`.
3. **Login Flow:**
   - Navigate to `http://localhost:3002/auth`.
   - Submit email `ops@kavach.ai`.
   - Retrieve single-use magic link from Mailpit (or console).
   - Enter current 6-digit TOTP code.
   - Secure, HTTP-only session cookie `kavach_admin_session` is issued with 30-minute idle and 8-hour absolute timeouts.

---

## 5. Demo Dataset Seeding

To populate the console with demonstrable synthetic telemetry, waitlist leads, tickets, and coupons:

```bash
python scripts/seed_demo_data.py
```

### Safety Features:
- **Refuses in Production:** Inspects `ENV` and `ENVIRONMENT`. If set to `production` or `prod`, the script aborts immediately with exit code 1.
- **Demo Flagging:** Sets `is_demo=1` on all seeded rows.
- **Admin UI Indicator:** The console displays an amber **DEMO DATASET ACTIVE** badge whenever demo data is active.

---

## 6. Database Maintenance & Backup

Kavach uses SQLite with WAL (Write-Ahead Logging) and portable ANSI SQL schemas compatible with PostgreSQL.

### 1. Migrations:
- Located in `apps/api/migrations/001_initial_core.sql` through `011_data_rights_and_modules.sql`.
- Applied automatically on startup via `apps/api/app/migrations.py`.
- Migration state is recorded in `schema_migrations`.

### 2. Hot Online Backups:
To create a clean snapshot of SQLite without interrupting active calls:
```bash
sqlite3 kavach.db ".backup 'backups/kavach_backup_$(date +%Y%m%d_%H%M%S).db'"
```

### 3. Migrating to PostgreSQL:
The schema uses standard SQL data types (`TEXT`, `INTEGER`, `REAL`). To migrate to PostgreSQL:
1. Replace SQLite connection in `apps/api/app/db.py` with `asyncpg` or `psycopg3`.
2. Replace `INTEGER PRIMARY KEY AUTOINCREMENT` with `BIGSERIAL PRIMARY KEY`.
3. All query syntax and parameter bindings (`?` or `$1`) conform to standard relational database specifications.

---

## 7. Incident Response Playbooks

### Incident 1: Suspected Admin Session Compromise
1. **Immediate Revocation:** Invalidate all active sessions in the database:
   ```sql
   DELETE FROM admin_sessions WHERE admin_email = 'compromised_user@kavach.ai';
   ```
2. **Key Rotation:** Change `ADMIN_SECRET_KEY` in environment and restart FastAPI service. This instantly invalidates all existing cookie signatures.
3. **Audit Log Verification:** Query `audit_log` for unauthorized mutations:
   ```sql
   SELECT actor, action, entity, created_at, client_ip FROM audit_log WHERE actor = 'compromised_user@kavach.ai' ORDER BY id DESC;
   ```

### Incident 2: Brute Force on Magic Links or TOTP
- **Automated Protection:** The system locks out authentication attempts after 5 consecutive failures for 15 minutes.
- **Operator Action:** Check IP origins from server logs:
  ```bash
  grep "Failed admin login attempt" /var/log/kavach/api.log
  ```
- Add offending subnet or IP to cloud firewall / Cloudflare WAF block list.

### Incident 3: Scam Emergency P0 SLA Breach Warning
- **Threshold:** Any ticket tagged `category='scam_emergency'` unassigned or without first response after 10 minutes triggers an urgent notification.
- **Operator Action:**
  1. Open Support Inbox view **🚨 Scam Emergency**.
  2. Confirm citizen safety and execute the emergency response protocol:
     - Advise immediate termination of the video call / phone call.
     - Instruct elder/guardian to dial **1930** (Indian Cybercrime Citizen Financial Cyber Fraud Reporting System) to freeze suspect accounts.
     - Direct to `https://cybercrime.gov.in`.
