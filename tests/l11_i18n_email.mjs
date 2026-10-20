/**
 * L11: Internationalization & Email Templates Test Suite
 * Tests multi-language template rendering (en/hi/gu), RFC 8058 headers,
 * header injection defenses, and suppression list enforcement.
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

async function runL11() {
  console.log('\n=== Running L11 Internationalization & Email Test Suite ===\n');

  try {
    const rawOutput = execSync('python scripts/testing/test_email_helpers.py', { encoding: 'utf-8' }).trim();
    const data = JSON.parse(rawOutput);

    record('T-EML-001', 'Multi-Language Email Template Rendering (en/hi/gu)', data.rendered_count >= 15,
      `Successfully rendered ${data.rendered_count} template-locale permutations without missing key errors`);

    record('T-EML-002', 'RFC 8058 One-Click List-Unsubscribe Header', data.has_rfc_unsub === true,
      'Marketing emails attach List-Unsubscribe and List-Unsubscribe-Post: List-Unsubscribe=One-Click');

    record('T-EML-003', 'SMTP Header Injection CRLF Neutralization', data.crlf_caught === true,
      'Injected \\r\\n carriage returns in header values strictly trapped with ValueError');

    record('T-EML-004', 'Email Suppression List Gatekeeper', data.suppression_working === true,
      'Suppressed email addresses blocked from delivery; active contacts permitted');
  } catch (err) {
    record('T-EML-001', 'Email Helpers Execution', false, err.message);
  }

  // Write results
  const outPath = path.join(ARTIFACTS_DIR, 'L11_i18n_email_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nL11 Results written to: ${outPath}`);
}

runL11().catch(console.error);
