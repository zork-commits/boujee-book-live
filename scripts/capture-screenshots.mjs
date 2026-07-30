// Captures real app screenshots for the marketing site + investor deck.
// Usage: node scripts/capture-screenshots.mjs  (dev server must be running on :8080)
import { chromium } from "playwright-core";
import { createClient } from "@libsql/client";

const BASE = "http://localhost:8080";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "public/screenshots";

const db = createClient({ url: "file:./data/boujee.db" });

async function seedTrackingState() {
  const tomorrow10 = new Date();
  tomorrow10.setDate(tomorrow10.getDate() + 1);
  tomorrow10.setHours(10, 0, 0, 0);
  const maya = (await db.execute(`SELECT id FROM users WHERE email='demo@boujeebook.app'`)).rows[0].id;
  await db.execute({
    sql: `INSERT OR REPLACE INTO bookings (id, customer_id, pro_id, service_id, service_name, price, mins, scheduled_at, status, location, created_at)
          VALUES ('shot-demo-booking', ?, 'marcus-vega', NULL, 'Signature Cut', 75, 45, ?, 'en_route', 'mobile', ?)`,
    args: [maya, tomorrow10.toISOString(), new Date().toISOString()],
  });
  return maya;
}

async function freshenLocations(maya) {
  const now = new Date().toISOString();
  for (const [role, lat, lng] of [["pro", 34.0702, -118.3000], ["customer", 34.0622, -118.3437]]) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO booking_locations (booking_id, role, lat, lng, accuracy, updated_at)
            VALUES ('shot-demo-booking', ?, ?, ?, 10, ?)`,
      args: [role, lat, lng, now],
    });
  }
}

async function cleanup() {
  await db.execute(`DELETE FROM booking_locations WHERE booking_id='shot-demo-booking'`);
  await db.execute(`DELETE FROM bookings WHERE id='shot-demo-booking'`);
  await db.execute(`DELETE FROM notifications WHERE title='New booking request' AND body LIKE '%shot%'`);
}

async function login(page, email) {
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500); // let React hydrate before interacting
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "boujee123");
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 8000 });
      return;
    } catch {
      await page.waitForTimeout(1000); // hydration race — try again
    }
  }
  throw new Error(`login failed for ${email}`);
}

async function shoot(page, path, name, settle = 1200) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(settle);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`captured ${name}`);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: false,
});
const page = await ctx.newPage();

const maya = await seedTrackingState();

await login(page, "demo@boujeebook.app");
await shoot(page, "/app", "home", 2500);
await shoot(page, "/app/search", "search", 2000);
await shoot(page, "/app/p/amara-cole", "pro-profile", 2500);
await shoot(page, "/app/book?pro=amara-cole", "booking", 1500);
await freshenLocations(maya);
await shoot(page, "/app/tracking?booking=shot-demo-booking", "tracking", 4000);
await shoot(page, "/app/messages", "messages", 1500);

const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page2 = await ctx2.newPage();
await login(page2, "marcus@boujeebook.app");
await shoot(page2, "/pro", "pro-dashboard", 2500);
await shoot(page2, "/pro/earnings", "pro-earnings", 2000);

await cleanup();
await browser.close();
console.log("done");
