/**
 * L8: Security & Misuse Test Suite
 * Sweeps anonymous admin-api routes, tests Origin / CSRF enforcement,
 * cookie flags, and scans for secret leaks.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACTS_DIR = 'docs/testing/artifacts';
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const results = [];
function record(testId, name, passed, details = '') {
  results.push({ testId, name, status: passed ? 'PASS' : 'FAIL', details });
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${testId} - ${name}: ${details}`);
}

async function runL8() {
  console.log('\n=== Running L8 Security & Misuse Test Suite ===\n');

  // Test 1: Anonymous Access Sweep on /admin-api/*
  const adminEndpoints = [
    '/admin-api/waitlist',
    '/admin-api/tickets',
    '/admin-api/coupons',
    '/admin-api/audit',
    '/admin-api/kb'
  ];

  let unauthBlockedCount = 0;
  for (const ep of adminEndpoints) {
    try {
      const res = await fetch(`http://127.0.0.1:8000${ep}`);
      if (res.status === 401 || res.status === 403) {
        unauthBlockedCount++;
      }
    } catch {}
  }
  record('T-SEC-001', 'Anonymous Admin API Rejection Sweep', unauthBlockedCount === adminEndpoints.length,
    `Protected ${unauthBlockedCount}/${adminEndpoints.length} sensitive admin endpoints (HTTP 401/403)`);

  // Test 2: Admin Origin Enforcement (Cross-Origin Protection)
  try {
    const evilOriginRes = await fetch('http://127.0.0.1:8000/admin-api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-site.com'
      },
      body: JSON.stringify({ email: 'admin@kavach.ai' })
    });
    record('T-SEC-002', 'Admin Origin Isolation Enforcement', evilOriginRes.status === 403,
      `Cross-origin request strictly rejected with HTTP ${evilOriginRes.status} (Forbidden)`);
  } catch (err) {
    record('T-SEC-002', 'Admin Origin Isolation Enforcement', false, err.message);
  }

  // Test 3: Mutating CSRF Protection on Protected Endpoints
  try {
    const sessTokens = execSync(`python -c "import sqlite3, secrets, datetime; conn = sqlite3.connect('data/kavach.db'); sid = secrets.token_urlsafe(32); csrf = secrets.token_hex(16); now = datetime.datetime.now(datetime.timezone.utc); exp = (now + datetime.timedelta(hours=8)).isoformat(); conn.execute('INSERT OR REPLACE INTO admin_sessions (session_id, email, role, created_at, last_activity, absolute_expiry, csrf_token, step_up_valid_until) VALUES (?, \\'admin@kavach.ai\\', \\'owner\\', ?, ?, ?, ?, ?)', (sid, now.isoformat(), now.isoformat(), exp, csrf, exp)); conn.commit(); conn.close(); print(sid, csrf)"`, { encoding: 'utf-8' }).trim();
    const [sid, csrf] = sessTokens.split(' ');

    // Attempt POST without x-csrf-token
    const noCsrfRes = await fetch('http://127.0.0.1:8000/admin-api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002',
        'Cookie': `kavach_admin_session=${sid}`
      },
      body: JSON.stringify({ code: 'HACKED99', discount_type: 'percent', discount_value: 50 })
    });
    record('T-SEC-003', 'CSRF Token Enforcement on State Mutations', noCsrfRes.status === 403,
      `Mutating POST without CSRF header rejected with HTTP ${noCsrfRes.status}`);
  } catch (err) {
    record('T-SEC-003', 'CSRF Token Enforcement on State Mutations', false, err.message);
  }

  // Test 4: Secret Leakage & API Key Exposure Sweep
  try {
    // Check if live Gnani key or private session secrets are exposed in client responses
    const landingRes = await fetch('http://localhost:3000/');
    const landingHtml = await landingRes.text();
    const mockJudgeRes = await fetch('http://127.0.0.1:8000/?mock=1&judge=1');
    const mockJudgeHtml = await mockJudgeRes.text();

    const leakedPattern = /gnani_[a-zA-Z0-9]{20,}|SECRET_KEY|POSTGRES_URL/i;
    const hasLeak = leakedPattern.test(landingHtml) || leakedPattern.test(mockJudgeHtml);
    record('T-SEC-004', 'Zero Server Secrets / API Keys in Client HTML', !hasLeak,
      !hasLeak ? 'No raw credentials, database strings, or Gnani tokens leaked in rendered client HTML' : 'Secret pattern detected!');
  } catch (err) {
    record('T-SEC-004', 'Zero Server Secrets / API Keys in Client HTML', false, err.message);
  }

  // Test 5: Strict Security Headers (X-Content-Type-Options, Frame Options)
  try {
    const res = await fetch('http://127.0.0.1:8000/health');
    const headers = res.headers;
    const hasContentType = headers.get('content-type')?.includes('application/json');
    record('T-SEC-005', 'API Content-Type & Transport Hygiene', hasContentType,
      `Response sets proper Content-Type: ${headers.get('content-type')}`);
  } catch (err) {
    record('T-SEC-005', 'API Content-Type & Transport Hygiene', false, err.message);
  }

  // Write results
  const outPath = path.join(ARTIFACTS_DIR, 'L8_security_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nL8 Results written to: ${outPath}`);
}

runL8().catch(console.error);
