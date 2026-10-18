import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('docs/img');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const TARGETS = [
  { url: 'http://localhost:3001/', name: 'desktop_1440_guardian_dashboard.png', width: 1440, height: 900 },
  { url: 'http://localhost:3001/auth', name: 'desktop_1440_guardian_auth.png', width: 1440, height: 900 },
  { url: 'http://localhost:3001/onboarding', name: 'desktop_1440_onboarding_wizard.png', width: 1440, height: 900 },
  { url: 'http://localhost:3001/alerts/alt-9821', name: 'desktop_1440_alert_timeline.png', width: 1440, height: 900 },
  { url: 'http://localhost:3001/billing', name: 'desktop_1440_billing_usage.png', width: 1440, height: 900 },
  { url: 'http://localhost:3001/elder', name: 'desktop_1440_elder_kiosk.png', width: 1440, height: 900 },
  { url: 'http://localhost:3002/', name: 'desktop_1440_admin_console.png', width: 1440, height: 900 },
  { url: 'http://localhost:3000/features', name: 'desktop_1440_features_page.png', width: 1440, height: 900 },
  { url: 'http://localhost:3000/learn', name: 'desktop_1440_learn_hub.png', width: 1440, height: 900 },
  { url: 'http://localhost:3000/learn/digital-arrest', name: 'desktop_1440_digital_arrest.png', width: 1440, height: 900 },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const t of TARGETS) {
    try {
      console.log(`Capturing ${t.name} from ${t.url}...`);
      await page.setViewportSize({ width: t.width, height: t.height });
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      const outPath = path.join(OUT_DIR, t.name);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
    } catch (err) {
      console.error(`Failed ${t.name}:`, err.message);
    }
  }

  await browser.close();
}

capture();
