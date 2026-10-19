# Kavach Email Deliverability & Domain Authentication Guide

This document defines DNS authentication records, email warm-up schedules, spam compliance standards, and outbox throttling mechanisms to ensure high inbox delivery rates for Kavach transactional notifications and waitlist broadcasts.

---

## 1. Domain Authentication Checklist

To prevent emails from landing in spam folders or being rejected by Google Workspace, Microsoft 365, and Yahoo Mail, configure the following DNS records for `<BRAND_DOMAIN>` (e.g. `kavach.ai`):

### 1. SPF (Sender Policy Framework)
- **Record Type:** `TXT`
- **Host / Name:** `@` (or `kavach.ai`)
- **TTL:** `3600`
- **Value:**
  ```text
  v=spf1 include:_spf.smtp-provider.com ~all
  ```
  *(Replace `_spf.smtp-provider.com` with your active SMTP relay: Amazon SES, Resend, or SendGrid).*

### 2. DKIM (DomainKeys Identified Mail)
- **Record Type:** `TXT` (or `CNAME` depending on provider)
- **Host / Name:** `kavach._domainkey`
- **TTL:** `3600`
- **Value:**
  ```text
  v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuZ8w0T3xJ7...
  ```
- **Standard:** Use a 2048-bit RSA key. Rotate annually.

### 3. DMARC (Domain-based Message Authentication, Reporting & Conformance)
- **Record Type:** `TXT`
- **Host / Name:** `_dmarc`
- **TTL:** `3600`
- **Strict Enforcement Value:**
  ```text
  v=DMARC1; p=reject; rua=mailto:dmarc-reports@kavach.ai; ruf=mailto:dmarc-forensics@kavach.ai; sp=reject; aspf=s; adkim=s
  ```
- **Policy Staging:**
  - *Phase 1 (Monitoring, Weeks 1-2):* `p=none`
  - *Phase 2 (Quarantine, Weeks 3-4):* `p=quarantine; pct=50`
  - *Phase 3 (Full Reject, Week 5+):* `p=reject; pct=100`

### 4. Reverse DNS (rDNS / PTR Record)
- The IP address of your sending mail server must resolve reversely to `mail.<BRAND_DOMAIN>`.
- The forward `A` record of `mail.<BRAND_DOMAIN>` must resolve back to that same IP address.

---

## 2. IP & Domain Warm-Up Schedule

When launching a new domain or dedicated sending IP, high initial email volume triggers ISP rate limits and spam filters. Follow this ramp schedule for broadcast campaigns:

| Period | Daily Volume Cap | Target Recipients | Throttling |
| :--- | :--- | :--- | :--- |
| **Week 1** | 50 emails / day | Internal team, highly engaged testers | 5 emails / minute |
| **Week 2** | 200 emails / day | Confirmed waitlist cohort 1 | 15 emails / minute |
| **Week 3** | 1,000 emails / day | Beta invites & double opt-in confirmations | 30 emails / minute |
| **Week 4** | 5,000 emails / day | Full waitlist broadcasts & newsletter updates | 60 emails / minute |
| **Week 5+** | Uncapped (within daily cap) | Regular production traffic | Configured `EMAIL_RATE_PER_MIN` |

---

## 3. Outbox Subsystem & Backoff Engine

Kavach employs an asynchronous Outbox Pattern (`email_outbox` table):

1. **Transactional vs Broadcast Separation:**
   - Transactional emails (single-use magic login links, ticket updates, scam alerts) bypass broadcast queues and dispatch immediately.
   - Broadcast emails (waitlist updates, product announcements) are queued with a `campaign_id` and dispatched at throttled intervals.
2. **Exponential Backoff:**
   - Attempt 1: Immediate.
   - Attempt 2: After 2 minutes.
   - Attempt 3: After 10 minutes.
   - Attempt 4: After 1 hour.
   - Attempt 5: After 6 hours.
   - If Attempt 5 fails, the status moves to `failed` and records the SMTP error code.
3. **Suppression List Enforcement:**
   - Permanent 5xx hard bounces and user complaints are automatically written to `email_suppression_list`.
   - The outbox worker skips any recipient in `email_suppression_list`, marking the message `suppressed` with zero network attempts.

---

## 4. Anti-Spam & Legal Compliance

Every email dispatched by Kavach strictly complies with international and Indian telecommunications regulations:

1. **RFC 8058 One-Click Unsubscribe:**
   All non-transactional marketing and waitlist emails carry required email headers:
   ```http
   List-Unsubscribe: <https://kavach.ai/unsubscribe?token=eyJ...>, <mailto:unsubscribe@kavach.ai?subject=unsubscribe:eyJ...>
   List-Unsubscribe-Post: List-Unsubscribe=One-Click
   ```
2. **Physical Identity Footer:**
   Every email layout includes the registered postal address and company entity:
   ```html
   <footer style="margin-top: 32px; color: #71717a; font-size: 11px;">
     Kavach Security Technologies Pvt. Ltd. · Pune, Maharashtra, India<br/>
     You received this email because you signed up for early access at kavach.ai.<br/>
     <a href="{{unsubscribe_url}}" style="color: #a1a1aa;">One-click Unsubscribe</a>
   </footer>
   ```
3. **Header Injection Defense:**
   All recipient email addresses, names, and subjects are validated against Carriage Return (`\r`) and Line Feed (`\n`) characters before socket transmission. Any attempt to inject headers triggers a security rejection.
4. **Privacy First:**
   Zero tracking pixels or invisible beacon images are injected by default. Click tracking is disabled to protect elder and caregiver privacy.
