import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('docs/img/admin');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 },
];

const MODULES = [
  { id: 'overview', name: 'overview', clickText: 'Telemetry Overview' },
  { id: 'waitlist', name: 'waitlist', clickText: 'Waitlist CRM & Campaigns' },
  { id: 'support', name: 'inbox', clickText: 'Support Inbox & SLAs' },
  { id: 'support', name: 'ticket_detail', clickText: 'Support Inbox & SLAs' },
  { id: 'coupons', name: 'coupons', clickText: 'Coupons & Referrals' },
  { id: 'exportCenter', name: 'export_center', clickText: 'Data Export Center' },
  { id: 'auditLog', name: 'audit', clickText: 'Audit Log (Immutable)' },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to Admin console at http://localhost:3002/ ...');
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle', timeout: 30000 });

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Capturing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    for (const mod of MODULES) {
      try {
        // Find and click sidebar button
        const button = page.locator(`button:has-text("${mod.clickText}")`).first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(400);
        }

        const filename = `${vp.name}_admin_${mod.name}.png`;
        const outPath = path.join(OUT_DIR, filename);
        await page.screenshot({ path: outPath, fullPage: false });
        console.log(`Saved: ${filename}`);
      } catch (err) {
        console.error(`Failed ${mod.name} at ${vp.name}:`, err.message);
      }
    }
  }

  await browser.close();
  console.log('\nAll Admin screenshots captured successfully!');
}

capture();
