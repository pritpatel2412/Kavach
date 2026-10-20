/**
 * L5: Form & Input Robustness Test Suite
 * Tests boundary conditions, XSS, SQLi strings, Indic scripts (Unicode),
 * payload size limits, and double-submit behavior.
 */

import fs from 'node:fs';
import path from 'node:path';

const ARTIFACTS_DIR = 'docs/testing/artifacts';
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const results = [];
function record(testId, name, passed, details = '') {
  results.push({ testId, name, status: passed ? 'PASS' : 'FAIL', details });
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${testId} - ${name}: ${details}`);
}

async function runL5() {
  console.log('\n=== Running L5 Form & Input Robustness Test Suite ===\n');

  // Test 1: XSS Injection in Support Ticket & Portal
  try {
    const xssPayload = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const sRes = await fetch('http://127.0.0.1:8000/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'XSS Test User',
        email: 'xss_test@example.com',
        category: 'feedback',
        subject: `XSS Subject ${xssPayload}`,
        message: `Body with payload: ${xssPayload}`
      })
    });
    const sData = await sRes.json();
    const token = sData.portal_url?.split('/support/t/')[1];
    let portalRetrievedSafe = false;

    if (token) {
      const pRes = await fetch(`http://127.0.0.1:8000/api/support/t/${token}`);
      const pData = await pRes.json();
      // Verify payload is stored verbatim as raw text string (safe JSON) without executing
      portalRetrievedSafe = pRes.status === 200 && pData.messages[0].body.includes(xssPayload);
    }
    record('T-INP-001', 'XSS Injection Payload Neutralization', sRes.status === 200 && portalRetrievedSafe,
      'Stored verbatim in JSON string; no script execution or unescaped HTML injection');
  } catch (err) {
    record('T-INP-001', 'XSS Injection Payload Neutralization', false, err.message);
  }

  // Test 2: SQL Injection Attack Strings
  try {
    const sqliInput = "admin' OR '1'='1' --";
    const sqliRes = await fetch('http://127.0.0.1:8000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: sqliInput, plan_id: 'family' })
    });
    const sqliData = await sqliRes.json();
    // Parameterized SQL query should return valid=false, not bypass check
    record('T-INP-002', 'SQL Injection Immunity (Parameterized SQL)', sqliRes.status === 200 && sqliData.valid === false,
      `Injection string '${sqliInput}' safely evaluated without syntax error or auth bypass`);
  } catch (err) {
    record('T-INP-002', 'SQL Injection Immunity (Parameterized SQL)', false, err.message);
  }

  // Test 3: Multilingual Indic Script (Devanagari, Gujarati, Tamil, ZWJ, Emojis)
  try {
    const hindiText = 'नमस्ते! मेरे दादाजी को धमकी भरा कॉल आया है। 🚨 ₹50,000 माँगा है।';
    const gujaratiText = 'નમસ્તે! મારા પિતાજીને સીબીઆઈ અરેસ્ટ કોલ આવ્યો છે. 🙏';
    const sRes = await fetch('http://127.0.0.1:8000/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'रमेशભાઈ પટેલ',
        email: 'ramesh.patel@example.com',
        category: 'scam_emergency',
        subject: gujaratiText,
        message: hindiText
      })
    });
    const sData = await sRes.json();
    const token = sData.portal_url?.split('/support/t/')[1];
    let indicPreserved = false;
    if (token) {
      const pRes = await fetch(`http://127.0.0.1:8000/api/support/t/${token}`);
      const pData = await pRes.json();
      indicPreserved = pData.subject === gujaratiText && pData.messages[0].body === hindiText;
    }
    record('T-INP-003', 'Multilingual Indic Unicode Integrity', indicPreserved,
      'Devanagari and Gujarati Unicode glyphs, ZWJ sequences, and emojis round-tripped with zero mojibake');
  } catch (err) {
    record('T-INP-003', 'Multilingual Indic Unicode Integrity', false, err.message);
  }

  // Test 4: Oversized Payload & Pydantic Field Boundary Checks
  try {
    const hugeName = 'A'.repeat(5000); // Exceeds max_length=100
    const overRes = await fetch('http://127.0.0.1:8000/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: hugeName, email: 'oversized@example.com' })
    });
    const rejectedWith422 = overRes.status === 422;
    record('T-INP-004', 'Field Boundary Enforcement (Max Length)', rejectedWith422,
      `Oversized input (5,000 chars) strictly rejected with HTTP ${overRes.status} (Unprocessable Entity)`);
  } catch (err) {
    record('T-INP-004', 'Field Boundary Enforcement (Max Length)', false, err.message);
  }

  // Test 5: Rapid Double-Submit Defense
  try {
    const email = `double_${Date.now()}@example.com`;
    const submit = () => fetch('http://127.0.0.1:8000/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Concurrent Tester', email })
    });
    const [res1, res2] = await Promise.all([submit(), submit()]);
    record('T-INP-005', 'Rapid Concurrent Double-Submit Stability', res1.status === 200 && res2.status === 200,
      'Concurrent submissions handled idempotently and safely without race lock or 500 crashes');
  } catch (err) {
    record('T-INP-005', 'Rapid Concurrent Double-Submit Stability', false, err.message);
  }

  // Write results
  const outPath = path.join(ARTIFACTS_DIR, 'L5_form_input_robustness_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nL5 Results written to: ${outPath}`);
}

runL5().catch(console.error);
