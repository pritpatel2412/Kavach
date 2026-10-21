# Kavach Production & Staging Email Deployment Playbook

This document defines DNS configurations, deliverability hygiene, sender verification, and end-to-end testing procedures for email delivery in Kavach.

---

## 1. Statutory Requirements & Deliverability Architecture

Under **India DPDP Act 2023** and anti-spam standards (RFC 7208, RFC 6376, RFC 7489, RFC 8058):
1. **Explicit Double Opt-In**: Waitlist and marketing contacts must verify email ownership before receiving product announcements.
2. **1-Click Unsubscribe (RFC 8058)**: Every automated email must include both an `Unsubscribe` HTTP link and a `List-Unsubscribe` header.
3. **No Phishing / Clean Domains**: Emails must NEVER link to raw backend IP addresses or API origins (`/api/...`). All links must point to the branded front-end (`https://kavach.ai`).
4. **Zero Console Logging Outside Local**: `EMAIL_MODE=smtp` is strictly enforced when `DEPLOY_MODE=staging` or `DEPLOY_MODE=production`.

---

## 2. DNS Records Specification (Apex: `kavach.ai`)

When configuring your production DNS provider (Cloudflare, Route53, Namecheap):

### A. SPF (Sender Policy Framework)
Authorize the transactional email provider to send on behalf of `@kavach.ai`:
```dns
Type: TXT
Name: @ (or kavach.ai)
Value: v=spf1 include:sendgrid.net ~all
TTL: 3600
```
*(If using Resend, use `include:resend.com ~all`; if Amazon SES, use `include:amazonses.com ~all`)*

### B. DKIM (DomainKeys Identified Mail)
Cryptographically signs each outbound email to prevent spoofing:
```dns
Type: CNAME
Name: kavach._domainkey.kavach.ai
Value: kavach.domainkey.sendgrid.net
TTL: 3600
```

### C. DMARC (Domain-based Message Authentication, Reporting & Conformance)
Enforces rejection of spoofed emails and reports alignment failures:
```dns
Type: TXT
Name: _dmarc.kavach.ai
Value: v=DMARC1; p=reject; rua=mailto:dmarc-reports@kavach.ai; pct=100; aspf=r; adkim=r
TTL: 3600
```

### D. Return-Path / Custom Mail-From Subdomain
Ensures SPF alignment and prevents "sent via sendgrid.net" warnings in Gmail:
```dns
Type: CNAME
Name: em.kavach.ai
Value: sendgrid.net
TTL: 3600
```

---

## 3. Environment Variables Configuration

Configure the following variables in your backend environment (Render / Railway / Docker):

| Variable | Staging Example | Production Example | Classification |
|---|---|---|---|
| `EMAIL_MODE` | `smtp` | `smtp` | Public Config |
| `SMTP_HOST` | `mailpit` (or staging relay) | `smtp.sendgrid.net` | Public Config |
| `SMTP_PORT` | `1025` (or `587`) | `587` | Public Config |
| `SMTP_USERNAME` | (optional in dev) | `apikey` | Secret |
| `SMTP_PASSWORD` | (optional in dev) | `SG.xxxxxxxxxxxx` | Secret |
| `SMTP_FROM_EMAIL` | `alerts@staging.kavach.ai` | `alerts@kavach.ai` | Public Config |
| `SMTP_FROM_NAME` | `Kavach Guardian (Staging)` | `Kavach Guardian` | Public Config |
| `PUBLIC_SITE_URL` | `https://staging.kavach.ai` | `https://kavach.ai` | Public Config |
| `PUBLIC_URL` | `https://api-staging.kavach.ai` | `https://api.kavach.ai` | Public Config |

---

## 4. Audit & Verification of Email Links

A critical rule of Sprint D is verifying that **no email contains localhost or direct API links**.

### Grep Audit Proof
In `apps/api/app/`:
- **Waitlist Confirmation**:
  ```python
  confirm_url = f"{s.public_site_url}/waitlist/confirmed?token={raw_token}"
  ```
  Points to the Next.js landing app confirmation screen (`apps/site/src/app/waitlist/confirmed/page.tsx`).
- **1-Click Unsubscribe**:
  ```python
  unsub_url = f"{s.public_site_url}/unsubscribe?token={unsub_token}"
  ```
  Points to the Next.js unsubscribe page (`apps/site/src/app/unsubscribe/page.tsx`).
- **Support Portal**:
  ```python
  portal_url = f"{s.public_site_url}/support/t/{portal_token}"
  ```
  Points to the Next.js customer support view (`apps/site/src/app/support/t/[token]/page.tsx`).
- **Guardian Magic-Link**:
  ```python
  login_link = f"{s.public_site_url}/app/login/verify?token={raw_token}"
  ```
  Points to the Guardian App login handler.

---

## 5. End-to-End Testing Procedures

### A. Local / Staging Testing with Mailpit
Our local prod-like environment includes Mailpit on port `1025` (SMTP) and `8025` (Web UI):
1. Start the stack: `docker-compose up -d mailpit`
2. Run test send:
   ```bash
   curl -X POST http://localhost:8000/api/waitlist \
     -H "Content-Type: application/json" \
     -d '{"email":"elder-care@example.com","name":"Aarav Sharma","state":"Maharashtra"}'
   ```
3. Open `http://localhost:8025` in browser to inspect the rendered HTML, headers, and click the confirmation link.

### B. Automated Test Suite
The following offline tests verify full email outbox queueing, retries, double opt-in, and SMTP dispatch:
- `apps/api/tests/test_email_outbox.py`: Verifies background outbox processor, retry backoff, and SMTP delivery.
- `apps/api/tests/test_waitlist_double_optin.py`: Tests token generation, email dispatch, confirmation idempotency, and unsubscribe.
- `apps/api/tests/test_support_tickets.py`: Tests customer receipt and support agent notification emails.

Run test suite:
```bash
.venv/bin/pytest apps/api/tests/test_email_outbox.py apps/api/tests/test_waitlist_double_optin.py
```

---

## 6. Optional Telegram Dispatch

Kavach also supports real-time Telegram alerts for critical scam interventions (P0):
- `TELEGRAM_BOT_TOKEN`: Token obtained from `@BotFather`.
- `TELEGRAM_CHAT_ID`: Caregiver or family group chat ID.
- If unconfigured, Telegram dispatch is cleanly skipped without raising errors.
