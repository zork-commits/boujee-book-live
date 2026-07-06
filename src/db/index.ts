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
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pro ON bookings(pro_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`;

let ready: Promise<void> | undefined;

/** Ensures tables exist and demo data is seeded. Call before any query. */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const statements = DDL.split(";").map((s) => s.trim()).filter(Boolean);
      for (const sql of statements) await client.execute(sql);
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
