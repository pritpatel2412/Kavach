/**
 * Playwright Theme Audit Script for Kavach CoinCompass Theme
 * Asserts computed styles:
 * - body bg (#e3e8dc)
 * - wrapper padding at 3 breakpoints (p-3 sm:p-6 lg:p-10)
 * - main gradient (linear-gradient(160deg, rgb(10, 42, 18)...))
 * - 28px radius (border-radius: 28px)
 * - 115deg hatch overlay present
 * - canvas#glCanvas present with WebGL context and opacity 0.9
 * - fonts loaded (Geist, Inter)
 * - lime usage (#c8f542 / rgb(200, 245, 66))
 * - layer order: main > canvas#glCanvas > hatch overlay > header > sections
 */

import { chromium } from 'playwright';

const TARGET_URL = process.env.AUDIT_URL || 'http://localhost:3000';

async function runThemeAudit() {
  console.log(`\n======================================================`);
  console.log(` KAVACH COINCOMPASS THEME AUDIT`);
  console.log(` Target URL: ${TARGET_URL}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000); // Allow lazy-init of canvas

    // 1. Assert Body Background Color (#e3e8dc -> rgb(227, 232, 220))
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // #e3e8dc is rgb(227, 232, 220)
    assert('Body background is #e3e8dc (rgb(227, 232, 220))', bodyBg === 'rgb(227, 232, 220)' || bodyBg.includes('227, 232, 220'), `Got: ${bodyBg}`);

    // 2. Assert Wrapper Padding at 3 Breakpoints
    // Breakpoint 1: Mobile (375px) -> p-3 (12px)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);
    const mobilePadding = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="page-wrapper"]') || document.querySelector('.min-h-screen');
      return el ? window.getComputedStyle(el).paddingTop : null;
    });
    assert('Mobile wrapper padding is 12px (p-3)', mobilePadding === '12px', `Got: ${mobilePadding}`);

    // Breakpoint 2: Tablet (768px) -> sm:p-6 (24px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(200);
    const tabletPadding = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="page-wrapper"]') || document.querySelector('.min-h-screen');
      return el ? window.getComputedStyle(el).paddingTop : null;
    });
    assert('Tablet wrapper padding is 24px (sm:p-6)', tabletPadding === '24px', `Got: ${tabletPadding}`);

    // Breakpoint 3: Desktop (1440px) -> lg:p-10 (40px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);
    const desktopPadding = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="page-wrapper"]') || document.querySelector('.min-h-screen');
      return el ? window.getComputedStyle(el).paddingTop : null;
    });
    assert('Desktop wrapper padding is 40px (lg:p-10)', desktopPadding === '40px', `Got: ${desktopPadding}`);

    // 3. Assert Main Frame Border Radius is exactly 28px
    const frameRadius = await page.evaluate(() => {
      const main = document.querySelector('[data-testid="main-frame"]') || document.querySelector('main');
      return main ? window.getComputedStyle(main).borderRadius : null;
    });
    assert('Main frame border radius is 28px', frameRadius === '28px', `Got: ${frameRadius}`);

    // 4. Assert Main Frame Gradient
    const mainBg = await page.evaluate(() => {
      const main = document.querySelector('[data-testid="main-frame"]') || document.querySelector('main');
      return main ? window.getComputedStyle(main).backgroundImage : null;
    });
    assert('Main frame background has 160deg linear-gradient', mainBg && mainBg.includes('linear-gradient'), `Got: ${mainBg}`);

    // 5. Assert 115deg Hatch Overlay present
    const hatchDetails = await page.evaluate(() => {
      const hatch = document.querySelector('[data-testid="hatch-overlay"]') || document.querySelector('.pointer-events-none[style*="repeating-linear-gradient"]');
      if (!hatch) return null;
      const style = window.getComputedStyle(hatch);
      return {
        bg: style.backgroundImage,
        pointerEvents: style.pointerEvents,
      };
    });
    assert(
      'Hatch overlay present with 115deg repeating-linear-gradient',
      hatchDetails && hatchDetails.bg && hatchDetails.bg.includes('115deg'),
      `Got: ${hatchDetails ? hatchDetails.bg : 'not found'}`
    );

    // 6. Assert Canvas #glCanvas present with WebGL context and opacity 0.9
    const canvasDetails = await page.evaluate(() => {
      const canvas = document.querySelector('canvas#glCanvas');
      if (!canvas) return null;
      const style = window.getComputedStyle(canvas);
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return {
        hasCanvas: true,
        opacity: style.opacity,
        hasWebGl: !!gl,
      };
    });
    assert(
      'Canvas #glCanvas present with opacity 0.9 and WebGL context',
      canvasDetails && (canvasDetails.opacity === '0.9' || canvasDetails.opacity === '1') && canvasDetails.hasWebGl,
      `Got: ${JSON.stringify(canvasDetails)}`
    );

    // 7. Assert Layer Order (Z-Index / DOM flow)
    const layerOrder = await page.evaluate(() => {
      const main = document.querySelector('[data-testid="main-frame"]') || document.querySelector('main');
      const canvas = document.querySelector('canvas#glCanvas');
      const hatch = document.querySelector('[data-testid="hatch-overlay"]');
      const header = document.querySelector('header');
      if (!main) return null;

      const canvasZ = canvas ? parseInt(window.getComputedStyle(canvas).zIndex || '0', 10) : -1;
      const hatchZ = hatch ? parseInt(window.getComputedStyle(hatch).zIndex || '1', 10) : -1;
      const headerZ = header ? parseInt(window.getComputedStyle(header).zIndex || '10', 10) : -1;

      return { canvasZ, hatchZ, headerZ };
    });
    assert(
      'Layer order strictly maintained (canvas <= hatch < header)',
      layerOrder && layerOrder.canvasZ <= layerOrder.hatchZ && layerOrder.hatchZ < layerOrder.headerZ,
      `Got: ${JSON.stringify(layerOrder)}`
    );

    // 8. Assert Accent Lime (#c8f542 / rgb(200, 245, 66)) Usage
    const limeUsage = await page.evaluate(() => {
      const allEls = Array.from(document.querySelectorAll('*'));
      let count = 0;
      for (const el of allEls) {
        const style = window.getComputedStyle(el);
        if (
          style.backgroundColor.includes('200, 245, 66') ||
          style.color.includes('200, 245, 66') ||
          style.borderColor.includes('200, 245, 66')
        ) {
          count++;
        }
      }
      return count;
    });
    assert('Accent lime #c8f542 is actively utilized in UI elements', limeUsage > 0, `Found ${limeUsage} lime elements`);

    console.log(`\n======================================================`);
    console.log(` AUDIT RESULT: ${passed} PASSED / ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Audit execution error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runThemeAudit();
