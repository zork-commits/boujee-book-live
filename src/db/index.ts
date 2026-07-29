import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

const url = process.env.DATABASE_URL ?? "file:./data/boujee.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (url.startsWith("file:")) {
  const { mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
}

const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  avatar TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pros (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  craft TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 5,
  review_count INTEGER NOT NULL DEFAULT 0,
  years INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL,
  distance REAL NOT NULL DEFAULT 0,
  avatar TEXT NOT NULL,
  cover TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  portfolio TEXT NOT NULL DEFAULT '[]',
  certifications TEXT NOT NULL DEFAULT '[]',
  elite INTEGER NOT NULL DEFAULT 0,
  verified INTEGER NOT NULL DEFAULT 0,
  mobile INTEGER NOT NULL DEFAULT 0,
  in_shop INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  pro_id TEXT NOT NULL REFERENCES pros(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  mins INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id),
  pro_id TEXT NOT NULL REFERENCES pros(id),
  service_id TEXT REFERENCES services(id),
  service_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  mins INTEGER NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  location TEXT NOT NULL DEFAULT 'shop',
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id),
  pro_id TEXT NOT NULL REFERENCES pros(id),
  last_message_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  pro_id TEXT NOT NULL REFERENCES pros(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS favorites (
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pro_id TEXT NOT NULL REFERENCES pros(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (customer_id, pro_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  pro_id TEXT NOT NULL REFERENCES pros(id),
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pro_hours (
  pro_id TEXT NOT NULL REFERENCES pros(id) ON DELETE CASCADE,
  dow INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  start_min INTEGER NOT NULL DEFAULT 540,
  end_min INTEGER NOT NULL DEFAULT 1140,
  PRIMARY KEY (pro_id, dow)
);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (blocker_id, blocked_user_id)
);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  meta TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pro ON bookings(pro_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
`;

/** Column additions for databases created before these features existed. */
const MIGRATIONS = [
  `ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
];

let ready: Promise<void> | undefined;

/** Ensures tables exist and demo data is seeded. Call before any query. */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const statements = DDL.split(";").map((s) => s.trim()).filter(Boolean);
      for (const sql of statements) await client.execute(sql);
      for (const sql of MIGRATIONS) {
        await client.execute(sql).catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes("duplicate column name")) throw err;
        });
      }
      // Every pro needs working-hours rows; backfill defaults (9:00–19:00 daily) for any missing.
      await client.execute(`
        INSERT OR IGNORE INTO pro_hours (pro_id, dow, enabled, start_min, end_min)
        SELECT pros.id, d.dow, 1, 540, 1140 FROM pros
        CROSS JOIN (SELECT 0 AS dow UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) d
      `);
      // Demo seed: on by default in dev, opt-in via SEED_DEMO=1 in production.
      const seedDemo = process.env.SEED_DEMO === "1" ||
        (process.env.SEED_DEMO === undefined && process.env.NODE_ENV !== "production");
      if (seedDemo) await seedIfEmpty(db);
    })().catch((err) => {
      ready = undefined; // allow retry on next request
      throw err;
    });
  }
  return ready;
}
