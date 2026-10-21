# Kavach Operations & Rollback Runbook

This runbook defines operational telemetry, automated backups, health monitors, and exact rollback procedures for Kavach in production.

---

## 1. Uptime Monitoring & Heartbeat Configuration

Continuous synthetic monitoring ensures that any degradation in database pooling, speech-to-text gateways, or email queues triggers immediate alerts before affecting users.

### Monitoring Service Setup (Better Uptime / Cronitor / Datadog)
- **Target URL**: `https://kavach.ai/api/health` (or `https://kavach-api.onrender.com/health`)
- **Check Frequency**: Every 60 seconds (1 minute interval)
- **Expected Status**: HTTP 200
- **Response Validation**: JSON body must contain `"ok": true` and `"db": "ok"`
- **Response Time Threshold (P95)**: < 500 ms
- **Degraded Condition**: If `"stt_mode": "mock_fallback"`, alert on cloud STT outage or daily quota exhaustion.
- **Alert Channels**: Telegram, PagerDuty, or SMS to engineering on-call.

---

## 2. Database Backup & Restore Procedures

Kavach separates durable multi-tenant records from ephemeral call data:
- **Durable Data**: Guardians, elders, device pairing codes, subscriptions, support tickets, coupons, audit log.
- **Ephemeral Data**: Scam transcripts (<=160 chars) auto-purged after 7 days; 0 raw audio stored.

### A. Automated Nightly Neon Backups & Point-in-Time Restore (PITR)
Neon automatically records WAL logs and retains point-in-time restore history for 7 days (or 30 days on paid tiers).
1. To restore to any minute in the past 7 days:
   ```bash
   # Via Neon CLI or Console
   neon branch create rollback-branch --from-branch production --time "2026-10-21T14:30:00Z"
   ```
2. Verify data integrity on the restore branch:
   ```bash
   DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" python -m pytest apps/api/tests/test_d2_container_backend.py
   ```
3. Set the restored branch as default or update `DATABASE_URL` in the container dashboard.

### B. Logical Backup via `pg_dump`
Run weekly or before major migrations:
```bash
# Export schema + data compressed
pg_dump "$DATABASE_URL_UNPOOLED" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="kavach_backup_$(date +%Y%m%d_%H%M%S).dump"

# Test restore into local test database
createdb kavach_restore_test
pg_restore -d kavach_restore_test kavach_backup_*.dump
```

---

## 3. Zero-Downtime Rollback Runbook

If a faulty release is deployed to production:

### Layer 1: Frontends (Vercel)
1. Navigate to the **Vercel Dashboard** for each project (`kavach-site`, `kavach-app`, `kavach-admin`).
2. Go to **Deployments**.
3. Locate the previous green deployment.
4. Click the three dots (`...`) $\rightarrow$ **Instant Rollback** (or **Promote to Production**).
5. Vercel edge routers immediately shift 100% of traffic to the prior immutable build artifact (< 2 seconds).

### Layer 2: Container Backend (Render / Railway / Docker)
If backend logic causes 500 errors or pipeline crashes:
1. Identify the previous working git commit SHA:
   ```bash
   git log --oneline -n 5
   ```
2. In **Render Dashboard**:
   - Go to **Settings** $\rightarrow$ **Build & Deploy** $\rightarrow$ Rollback to previous deployment.
   - Or deploy specific commit: Select previous commit SHA in the manual deploy drawer.
3. In **Docker / Self-Hosted**:
   ```bash
   docker stop kavach-api
   docker run -d --name kavach-api -p 8000:8000 --env-file .env kavach-api:<previous_sha>
   ```

### Layer 3: Database Migrations
Migrations in `apps/api/migrations/` are written to be **strictly additive and backward-compatible**:
- New columns always include defaults (`DEFAULT 0`, `DEFAULT ''`, or `NULL`).
- No destructive drops of tables or existing columns occur during rolling updates.
- If a migration must be reverted, apply an explicit rollback script rather than dropping the table.

---

## 4. Local Verification of Rollback Procedure

To test rollback behavior in local staging:
1. Launch local stack:
   ```bash
   docker-compose up -d
   ```
2. Verify healthy status:
   ```bash
   curl -s http://localhost:8000/health | grep '"ok":true'
   ```
3. Simulate failure by pausing postgres container:
   ```bash
   docker-compose pause postgres
   curl -s http://localhost:8000/health
   # Returns: {"ok":false,"db":"error"}
   ```
4. Unpause / recover:
   ```bash
   docker-compose unpause postgres
   curl -s http://localhost:8000/health
   # Returns: {"ok":true,"db":"ok"}
   ```
