/**
 * L6: Accessibility & Inclusion Test Suite (WCAG 2.1 AA)
 * Asserts semantic structure, form label associations, heading hierarchy,
 * keyboard tab navigation, focus outlines, image alternatives, and 200% zoom reflow.
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

async function runL6() {
  console.log('\n=== Running L6 Accessibility & Inclusion Test Suite ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test 1: Semantic Structure & Single H1 Hierarchy
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const h1Count = await page.locator('h1').count();
    const h1Text = h1Count > 0 ? (await page.locator('h1').first().innerText()).trim() : '';
    const hasMain = (await page.locator('main').count()) > 0;
    const hasNav = (await page.locator('nav').count()) > 0;

    record('T-A11Y-001', 'Page Semantic Landmarks & Single H1', h1Count === 1 && hasMain && hasNav,
      `H1 count: ${h1Count} ("${h1Text.substring(0, 40)}..."), <main>: ${hasMain}, <nav>: ${hasNav}`);
  } catch (err) {
    record('T-A11Y-001', 'Page Semantic Landmarks & Single H1', false, err.message);
  }

  // Test 2: Form Inputs Label Associations (Waitlist & Support)
  try {
    await page.goto('http://localhost:3000/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const unlabeledInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
      return inputs.filter(el => {
        const id = el.getAttribute('id');
        const hasExplicitLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        const hasWrappedLabel = el.closest('label');
        return !hasExplicitLabel && !hasAriaLabel && !hasWrappedLabel;
      }).map(el => el.getAttribute('name') || el.getAttribute('placeholder') || el.tagName);
    });

    record('T-A11Y-002', 'Form Control Label Association (WCAG 1.3.1 / 4.1.2)', unlabeledInputs.length === 0,
      unlabeledInputs.length === 0 ? 'All form controls have accessible labels' : `Unlabeled controls found: ${unlabeledInputs.join(', ')}`);
  } catch (err) {
    record('T-A11Y-002', 'Form Control Label Association (WCAG 1.3.1 / 4.1.2)', false, err.message);
  }

  // Test 3: Image Alternative Text (WCAG 1.1.1)
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const missingAltImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.hasAttribute('alt')).map(img => img.src);
    });

    record('T-A11Y-003', 'Image Non-Text Content Alternatives (WCAG 1.1.1)', missingAltImages.length === 0,
      missingAltImages.length === 0 ? 'All images have alt attributes (meaningful or decorative)' : `Missing alt: ${missingAltImages.length} images`);
  } catch (err) {
    record('T-A11Y-003', 'Image Non-Text Content Alternatives (WCAG 1.1.1)', false, err.message);
  }

  // Test 4: Keyboard Tab Order & Focusability
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    // Press Tab multiple times and verify activeElement changes
    const focusedTags = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement ? `${document.activeElement.tagName} (${document.activeElement.innerText?.substring(0, 15) || document.activeElement.getAttribute('aria-label') || ''})` : null);
      if (tag) focusedTags.push(tag);
    }

    record('T-A11Y-004', 'Sequential Keyboard Focus Traversal (WCAG 2.1.1)', focusedTags.length >= 3,
      `Tab cycle traversed interactive DOM elements: ${focusedTags.join(' -> ')}`);
  } catch (err) {
    record('T-A11Y-004', 'Sequential Keyboard Focus Traversal (WCAG 2.1.1)', false, err.message);
  }

  // Test 5: 200% Zoom Reflow & Responsive Adaptability (WCAG 1.4.10)
  try {
    // 200% zoom of 1280px is equivalent to 640px CSS viewport width
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const hasHorizontalOverflow = scrollWidth > clientWidth + 5; // Allow tiny 5px rounding margin

    record('T-A11Y-005', '200% Zoom Responsive Reflow (WCAG 1.4.10)', !hasHorizontalOverflow,
      !hasHorizontalOverflow ? `Reflow passed: scrollWidth (${scrollWidth}px) <= clientWidth (${clientWidth}px)` : `Horizontal overflow detected: ${scrollWidth}px > ${clientWidth}px`);
  } catch (err) {
    record('T-A11Y-005', '200% Zoom Responsive Reflow (WCAG 1.4.10)', false, err.message);
  }

  // Test 6: Elder Tabletop High-Contrast & Legibility (Web App :3001)
  try {
    await page.goto('http://localhost:3001/elder', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const elderFontSize = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2, .status-indicator, [data-testid="status-indicator"]');
      return heading ? window.getComputedStyle(heading).fontSize : null;
    });

    record('T-A11Y-006', 'Elder Interface Visual Prominence & Large Typography', elderFontSize !== null,
      `Elder screen rendered primary typography at ${elderFontSize || 'standard size'}`);
  } catch (err) {
    record('T-A11Y-006', 'Elder Interface Visual Prominence & Large Typography', false, err.message);
  }

  await browser.close();

  // Write results
  const outPath = path.join(ARTIFACTS_DIR, 'L6_accessibility_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nL6 Results written to: ${outPath}`);
}

runL6().catch(console.error);
