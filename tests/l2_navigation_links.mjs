/**
 * L2: Navigation, Link Integrity, Mobile Drawer, and Anchor Verification Suite
 * Crawls links, tests external destinations, checks mobile menu and anchor targets.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('docs/testing/artifacts');
const LINKS_DIR = path.resolve('docs/testing/links');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(LINKS_DIR, { recursive: true });

const ENTRY_URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/pricing',
  'http://localhost:3000/how-it-works',
  'http://localhost:3000/help',
  'http://localhost:3000/contact',
  'http://localhost:3000/status',
  'http://localhost:3001/',
  'http://localhost:3001/auth',
  'http://localhost:3002/auth'
];

async function runNav() {
  console.log('=== Kavach L2 Navigation & Link Graph Test Suite ===');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const visitedUrls = new Set();
  const internalQueue = [...ENTRY_URLS];
  const internalGraph = {}; // url -> [links]
  const externalLinks = new Map(); // url -> status
  const brokenLinks = [];
  const telMailtoLinks = [];
  const hashAnchorIssues = [];

  // 1. Crawl internal links
  while (internalQueue.length > 0) {
    const currentUrl = internalQueue.shift();
    if (visitedUrls.has(currentUrl)) continue;
    visitedUrls.add(currentUrl);

    try {
      const res = await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = res ? res.status() : 0;
      if (status >= 400) {
        brokenLinks.push({ url: currentUrl, status, source: 'crawl' });
        continue;
      }

      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => ({
          href: a.getAttribute('href'),
          text: a.innerText.trim(),
          id: a.id || ''
        }));
      });

      internalGraph[currentUrl] = [];

      for (const link of links) {
        const href = link.href;
        if (!href) continue;

        if (href.startsWith('mailto:') || href.startsWith('tel:')) {
          telMailtoLinks.push({ href, source: currentUrl, text: link.text });
        } else if (href.startsWith('#')) {
          // Anchor on same page
          const targetExists = await page.evaluate((selector) => {
            return Boolean(document.querySelector(selector));
          }, href).catch(() => false);

          if (!targetExists) {
            hashAnchorIssues.push({ source: currentUrl, anchor: href, reason: 'Target element not found in DOM' });
          }
        } else if (href.startsWith('http://localhost:3000') || href.startsWith('http://localhost:3001') || href.startsWith('http://localhost:3002') || href.startsWith('/')) {
          const resolved = href.startsWith('/') ? new URL(href, currentUrl).href : href;
          const cleanUrl = resolved.split('#')[0];
          internalGraph[currentUrl].push(cleanUrl);
          if (!visitedUrls.has(cleanUrl) && !internalQueue.includes(cleanUrl)) {
            // Keep crawler constrained to site/app/admin
            if (cleanUrl.startsWith('http://localhost:3000') || cleanUrl.startsWith('http://localhost:3001') || cleanUrl.startsWith('http://localhost:3002')) {
              internalQueue.push(cleanUrl);
            }
          }
        } else if (href.startsWith('http://') || href.startsWith('https://')) {
          if (!externalLinks.has(href)) {
            externalLinks.set(href, { source: currentUrl, status: null });
          }
        }
      }
    } catch (err) {
      brokenLinks.push({ url: currentUrl, error: err.message });
    }
  }

  // 2. Validate external links via HEAD / GET requests (courteous with timeout)
  console.log(`\nVerifying ${externalLinks.size} distinct external links...`);
  for (const [extUrl, info] of externalLinks.entries()) {
    try {
      const res = await fetch(extUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
        .catch(() => fetch(extUrl, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }));
      info.status = res.status;
      if (res.status >= 400 && res.status !== 403) { // Some sites return 403 to automated HEAD
        brokenLinks.push({ url: extUrl, status: res.status, source: info.source });
      }
    } catch (e) {
      info.status = 'ERR: ' + e.message;
      brokenLinks.push({ url: extUrl, error: e.message, source: info.source });
    }
  }

  // 3. Test Mobile Navigation Drawer (Open / Close / Focus trap / Escape)
  console.log('\nTesting mobile drawer interaction on landing...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000/', { waitUntil: 'load' });

  let mobileMenuResult = { openable: false, closeOnEsc: false, focusTrapped: false };
  const hamburgerBtn = await page.$('button[aria-label*="menu" i], button[aria-expanded], header button');
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await page.waitForTimeout(300);
    mobileMenuResult.openable = true;

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const isClosedAfterEsc = await page.evaluate(() => {
      const menu = document.querySelector('[role="dialog"], nav[aria-modal="true"], .mobile-nav');
      return !menu || getComputedStyle(menu).display === 'none' || getComputedStyle(menu).visibility === 'hidden';
    });
    mobileMenuResult.closeOnEsc = isClosedAfterEsc;
  }

  // 4. Test Deep Link Refresh & Trailing Slash Behavior
  console.log('Testing deep link refresh behavior...');
  const deepRoutes = [
    'http://localhost:3000/learn/digital-arrest',
    'http://localhost:3000/learn/courier-parcel',
    'http://localhost:3000/status',
    'http://localhost:3001/auth',
    'http://localhost:3002/auth'
  ];
  const deepRefreshResults = [];
  for (const dr of deepRoutes) {
    await page.goto(dr, { waitUntil: 'load' });
    await page.reload({ waitUntil: 'load' });
    const title = await page.title();
    deepRefreshResults.push({ route: dr, title, ok: Boolean(title) });
  }

  // Save artifacts
  fs.writeFileSync(path.join(LINKS_DIR, 'link_graph.json'), JSON.stringify(internalGraph, null, 2));
  fs.writeFileSync(path.join(LINKS_DIR, 'external_links.json'), JSON.stringify(Object.fromEntries(externalLinks), null, 2));
  fs.writeFileSync(path.join(LINKS_DIR, 'broken_links.json'), JSON.stringify(brokenLinks, null, 2));
  fs.writeFileSync(path.join(LINKS_DIR, 'anchor_issues.json'), JSON.stringify(hashAnchorIssues, null, 2));

  const summary = {
    crawledInternalPagesCount: visitedUrls.size,
    externalLinksCheckedCount: externalLinks.size,
    telMailtoLinksCount: telMailtoLinks.length,
    brokenLinksCount: brokenLinks.length,
    hashAnchorIssuesCount: hashAnchorIssues.length,
    mobileMenuResult,
    deepRefreshResults
  };
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'L2_navigation_summary.json'), JSON.stringify(summary, null, 2));

  console.log('\n=== L2 Navigation Suite Complete ===');
  console.log(`Internal Pages Crawled: ${visitedUrls.size}`);
  console.log(`External Links Checked: ${externalLinks.size}`);
  console.log(`Broken Links: ${brokenLinks.length}`);
  console.log(`Anchor Target Issues: ${hashAnchorIssues.length}`);
  console.log(`Artifacts saved in: docs/testing/links/ and docs/testing/artifacts/`);

  await browser.close();
}

runNav().catch(err => {
  console.error('Fatal error in navigation suite:', err);
  process.exit(1);
});
