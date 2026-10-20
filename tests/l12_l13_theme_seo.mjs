/**
 * L12 & L13: Visual Theme (CoinCompass Law) & SEO Test Suite
 * Asserts computed styles against docs/design/THEME.md (#e3e8dc bg, 28px radius,
 * #c8f542 lime accent) and verifies SEO metadata (title, meta description, OG tags).
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACTS_DIR = 'docs/testing/artifacts';
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const results = [];
function record(testId, name, passed, details = '') {
  results.push({ testId, name, status: passed ? 'PASS' : 'FAIL', details });
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${testId} - ${name}: ${details}`);
}

async function runL12L13() {
  console.log('\n=== Running L12 & L13 Visual Theme & SEO Test Suite ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test 1: CoinCompass Body Background Color (#e3e8dc)
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    const isE3E8DC = bodyBg === 'rgb(227, 232, 220)' || bodyBg.includes('227, 232, 220');

    record('T-THM-001', 'Body Background Token #e3e8dc (CoinCompass Law)', isE3E8DC,
      `Computed body background: ${bodyBg} (Expected: rgb(227, 232, 220))`);
  } catch (err) {
    record('T-THM-001', 'Body Background Token #e3e8dc (CoinCompass Law)', false, err.message);
  }

  // Test 2: Main Frame 28px Rounded Border Radius
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const radius = await page.evaluate(() => {
      const el = document.querySelector('main, [data-testid="main-frame"], .rounded-\\[28px\\]');
      return el ? window.getComputedStyle(el).borderRadius : null;
    });
    const has28px = radius === '28px' || radius?.includes('28px');

    record('T-THM-002', 'Container 28px Rounded Geometry', has28px,
      `Computed container border-radius: ${radius || 'not explicitly styled'}`);
  } catch (err) {
    record('T-THM-002', 'Container 28px Rounded Geometry', false, err.message);
  }

  // Test 3: Accent Lime Token Usage (#c8f542)
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const usesLime = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button, a, span, .text-accent'));
      return els.some(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor === 'rgb(200, 245, 66)' || style.color === 'rgb(200, 245, 66)';
      });
    });

    record('T-THM-003', 'Accent Lime #c8f542 Component Theming', usesLime,
      usesLime ? 'Primary CTAs / accents incorporate #c8f542 (rgb(200, 245, 66))' : 'Lime accent not detected in primary elements');
  } catch (err) {
    record('T-THM-003', 'Accent Lime #c8f542 Component Theming', false, err.message);
  }

  // Test 4: Search Engine Optimization (Title & Meta Description)
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await page.title();
    const metaDesc = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]');
      return el ? el.getAttribute('content') : null;
    });
    const titleValid = title.includes('Kavach') && title.length > 10;
    const descValid = metaDesc && metaDesc.length > 20;

    record('T-SEO-001', 'Core SEO Metadata (Title & Meta Description)', titleValid && descValid,
      `Title: "${title}", Description length: ${metaDesc ? metaDesc.length : 0} chars`);
  } catch (err) {
    record('T-SEO-001', 'Core SEO Metadata (Title & Meta Description)', false, err.message);
  }

  // Test 5: OpenGraph & Social Sharing Meta Tags
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const ogTags = await page.evaluate(() => {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
      return { ogTitle, ogType };
    });
    const hasOg = !!(ogTags.ogTitle || ogTags.ogType);

    record('T-SEO-002', 'OpenGraph Social Sharing Tags', hasOg,
      hasOg ? `OG Title: "${ogTags.ogTitle || 'present'}"` : 'OpenGraph meta tags configured');
  } catch (err) {
    record('T-SEO-002', 'OpenGraph Social Sharing Tags', false, err.message);
  }

  await browser.close();

  // Write results
  const outPath = path.join(ARTIFACTS_DIR, 'L12_l13_theme_seo_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nL12/L13 Results written to: ${outPath}`);
}

runL12L13().catch(console.error);
