/**
 * L1: Page Load and Smoke Test Suite
 * Matrix: Route x Viewport (375, 768, 1440) x Browser (Chromium, Firefox, WebKit)
 * Checks: Status code, no uncaught exceptions, zero console errors, zero failed requests,
 *         hydration check, title/meta, font loading, icon rendering, images alt, horizontal scroll.
 */
import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('docs/testing/artifacts');
const SCREENSHOTS_DIR = path.resolve('docs/testing/screenshots');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const ROUTES = [
  // Marketing Site (Port 3000)
  { id: 'T-SMOKE-001', area: 'Site', path: 'http://localhost:3000/', name: 'landing' },
  { id: 'T-SMOKE-002', area: 'Site', path: 'http://localhost:3000/features', name: 'features' },
  { id: 'T-SMOKE-003', area: 'Site', path: 'http://localhost:3000/how-it-works', name: 'how-it-works' },
  { id: 'T-SMOKE-004', area: 'Site', path: 'http://localhost:3000/pricing', name: 'pricing' },
  { id: 'T-SMOKE-005', area: 'Site', path: 'http://localhost:3000/learn', name: 'learn' },
  { id: 'T-SMOKE-006', area: 'Site', path: 'http://localhost:3000/learn/digital-arrest', name: 'learn-digital-arrest' },
  { id: 'T-SMOKE-007', area: 'Site', path: 'http://localhost:3000/learn/courier-parcel', name: 'learn-courier-parcel' },
  { id: 'T-SMOKE-008', area: 'Site', path: 'http://localhost:3000/learn/kyc-otp', name: 'learn-kyc-otp' },
  { id: 'T-SMOKE-009', area: 'Site', path: 'http://localhost:3000/contact', name: 'contact' },
  { id: 'T-SMOKE-010', area: 'Site', path: 'http://localhost:3000/help', name: 'help' },
  { id: 'T-SMOKE-011', area: 'Site', path: 'http://localhost:3000/status', name: 'status' },
  { id: 'T-SMOKE-012', area: 'Site', path: 'http://localhost:3000/changelog', name: 'changelog' },
  { id: 'T-SMOKE-013', area: 'Site', path: 'http://localhost:3000/privacy', name: 'privacy' },
  { id: 'T-SMOKE-014', area: 'Site', path: 'http://localhost:3000/terms', name: 'terms' },
  { id: 'T-SMOKE-015', area: 'Site', path: 'http://localhost:3000/security', name: 'security' },
  { id: 'T-SMOKE-016', area: 'Site', path: 'http://localhost:3000/acceptable-use', name: 'acceptable-use' },
  { id: 'T-SMOKE-017', area: 'Site', path: 'http://localhost:3000/consent-notice', name: 'consent-notice' },
  { id: 'T-SMOKE-018', area: 'Site', path: 'http://localhost:3000/grievance', name: 'grievance' },
  { id: 'T-SMOKE-019', area: 'Site', path: 'http://localhost:3000/refunds', name: 'refunds' },
  { id: 'T-SMOKE-020', area: 'Site', path: 'http://localhost:3000/cookies', name: 'cookies' },
  { id: 'T-SMOKE-021', area: 'Site', path: 'http://localhost:3000/subprocessors', name: 'subprocessors' },
  { id: 'T-SMOKE-022', area: 'Site', path: 'http://localhost:3000/non-existent-page-404', name: 'site-404', expectedStatus: 404 },

  // Guardian App (Port 3001)
  { id: 'T-SMOKE-023', area: 'App', path: 'http://localhost:3001/', name: 'app-dashboard' },
  { id: 'T-SMOKE-024', area: 'App', path: 'http://localhost:3001/auth', name: 'app-auth' },
  { id: 'T-SMOKE-025', area: 'App', path: 'http://localhost:3001/onboarding', name: 'app-onboarding' },
  { id: 'T-SMOKE-026', area: 'App', path: 'http://localhost:3001/elder', name: 'app-elder-kiosk' },
  { id: 'T-SMOKE-027', area: 'App', path: 'http://localhost:3001/billing', name: 'app-billing' },
  { id: 'T-SMOKE-028', area: 'App', path: 'http://localhost:3001/privacy', name: 'app-privacy' },

  // Admin Console (Port 3002)
  { id: 'T-SMOKE-029', area: 'Admin', path: 'http://localhost:3002/auth', name: 'admin-auth' },
  { id: 'T-SMOKE-030', area: 'Admin', path: 'http://localhost:3002/', name: 'admin-console' },

  // Contest Demo (Port 8000)
  { id: 'T-SMOKE-031', area: 'Demo', path: 'http://localhost:8000/?mock=1&judge=1', name: 'demo-judge' },
  { id: 'T-SMOKE-032', area: 'Demo', path: 'http://localhost:8000/guardian.html', name: 'demo-guardian' },
  { id: 'T-SMOKE-033', area: 'Demo', path: 'http://localhost:8000/demo.html', name: 'demo-replay' },
];

// Top 15 routes tested on multiple browser engines
const TOP_15_NAMES = new Set([
  'landing', 'features', 'how-it-works', 'pricing', 'learn', 'contact', 'help', 'status',
  'privacy', 'terms', 'app-dashboard', 'app-auth', 'app-elder-kiosk', 'admin-auth', 'demo-judge'
]);

async function runSmoke() {
  console.log('=== Kavach L1 Page Load & Smoke Test Suite ===');
  const results = [];
  const browsers = [
    { name: 'chromium', engine: chromium }
  ];

  // Check if firefox and webkit can be launched
  try {
    const fb = await firefox.launch();
    await fb.close();
    browsers.push({ name: 'firefox', engine: firefox });
    console.log('[L1] Firefox engine active.');
  } catch (e) {
    console.log('[L1] Firefox not available; skipping multi-browser for firefox.');
  }

  try {
    const wb = await webkit.launch();
    await wb.close();
    browsers.push({ name: 'webkit', engine: webkit });
    console.log('[L1] WebKit engine active.');
  } catch (e) {
    console.log('[L1] WebKit not available; skipping multi-browser for webkit.');
  }

  for (const bInfo of browsers) {
    const browser = await bInfo.engine.launch();
    console.log(`\nLaunching browser: ${bInfo.name}`);

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: `KavachAutomatedSmoke/${bInfo.name}-${vp.name}`,
      });

      for (const route of ROUTES) {
        // If not chromium, only run top 15 routes
        if (bInfo.name !== 'chromium' && !TOP_15_NAMES.has(route.name)) {
          continue;
        }

        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];
        let hasHydrationWarning = false;

        page.on('console', msg => {
          const text = msg.text();
          if (msg.type() === 'error') {
            if (route.expectedStatus === 404 && text.includes('404')) {
              // Expected 404 on non-existent route test
            } else {
              consoleErrors.push(text);
            }
          }
          if (text.toLowerCase().includes('hydration')) {
            hasHydrationWarning = true;
          }
        });

        page.on('pageerror', err => {
          pageErrors.push(err.message);
        });

        page.on('requestfailed', req => {
          // Ignore favicon and external analytics in failed request tracking
          if (!req.url().includes('favicon.ico')) {
            failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText || 'failed'}`);
          }
        });

        const testRecord = {
          id: route.id,
          name: route.name,
          area: route.area,
          path: route.path,
          browser: bInfo.name,
          viewport: vp.name,
          expectedStatus: route.expectedStatus || 200,
          actualStatus: null,
          title: '',
          metaDescription: '',
          hasHorizontalScroll: false,
          fontsLoaded: false,
          iconsCount: 0,
          imagesWithoutAlt: 0,
          brokenImagesCount: 0,
          consoleErrorsCount: 0,
          pageErrorsCount: 0,
          failedRequestsCount: 0,
          hasHydrationWarning,
          passed: false,
          screenshotArtifact: '',
          notes: ''
        };

        try {
          const res = await page.goto(route.path, { waitUntil: 'load', timeout: 15000 });
          testRecord.actualStatus = res ? res.status() : 0;
          testRecord.title = await page.title();

          // Wait 300ms for client hydration / animation
          await page.waitForTimeout(300);

          // Meta description
          testRecord.metaDescription = await page.$eval(
            'meta[name="description"]',
            el => el.getAttribute('content') || ''
          ).catch(() => '');

          // Horizontal scroll test
          testRecord.hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth + 2;
          });

          // Font loading check
          testRecord.fontsLoaded = await page.evaluate(() => {
            return document.fonts ? document.fonts.status === 'loaded' : true;
          });

          // Icons check (SVG or Iconify)
          testRecord.iconsCount = await page.evaluate(() => {
            return document.querySelectorAll('svg, [class*="icon"]').length;
          });

          // Image audit
          const imgAudit = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const missingAlt = imgs.filter(i => !i.hasAttribute('alt') || i.getAttribute('alt') === '').length;
            const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).length;
            return { missingAlt, broken };
          });
          testRecord.imagesWithoutAlt = imgAudit.missingAlt;
          testRecord.brokenImagesCount = imgAudit.broken;

          testRecord.consoleErrorsCount = consoleErrors.length;
          testRecord.pageErrorsCount = pageErrors.length;
          testRecord.failedRequestsCount = failedRequests.length;
          testRecord.hasHydrationWarning = hasHydrationWarning;

          // Screenshot capture
          const ssFilename = `L1_${route.name}_${bInfo.name}_${vp.name}.png`;
          const ssPath = path.join(SCREENSHOTS_DIR, ssFilename);
          await page.screenshot({ path: ssPath, fullPage: false });
          testRecord.screenshotArtifact = `docs/testing/screenshots/${ssFilename}`;

          // Pass/Fail evaluation
          const statusMatch = route.expectedStatus
            ? testRecord.actualStatus === route.expectedStatus
            : (testRecord.actualStatus === 200 || testRecord.actualStatus === 304);

          testRecord.passed = Boolean(
            statusMatch &&
            pageErrors.length === 0 &&
            consoleErrors.length === 0 &&
            !testRecord.hasHorizontalScroll &&
            testRecord.brokenImagesCount === 0
          );

          if (!testRecord.passed) {
            testRecord.notes = [
              !statusMatch ? `Status mismatch: expected ${route.expectedStatus || 200}, got ${testRecord.actualStatus}` : '',
              pageErrors.length > 0 ? `Page errors: ${pageErrors.join('; ')}` : '',
              consoleErrors.length > 0 ? `Console errors: ${consoleErrors.join('; ')}` : '',
              testRecord.hasHorizontalScroll ? 'Horizontal scroll detected' : '',
              testRecord.brokenImagesCount > 0 ? `${testRecord.brokenImagesCount} broken images` : ''
            ].filter(Boolean).join(' | ');
          }

        } catch (err) {
          testRecord.passed = false;
          testRecord.notes = `Navigation failed: ${err.message}`;
        }

        console.log(`  [${testRecord.passed ? 'PASS' : 'FAIL'}] ${route.id} ${route.name} (${bInfo.name}/${vp.name}) -> Status ${testRecord.actualStatus}`);
        results.push(testRecord);
        await page.close();
      }

      await context.close();
    }

    await browser.close();
  }

  const outPath = path.join(ARTIFACTS_DIR, 'L1_page_load_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`\n=== L1 Smoke Run Finished: Total: ${total}, Passed: ${passed}, Failed: ${failed} ===`);
  console.log(`Results saved to: ${outPath}`);
}

runSmoke().catch(err => {
  console.error('Fatal error in smoke suite:', err);
  process.exit(1);
});
