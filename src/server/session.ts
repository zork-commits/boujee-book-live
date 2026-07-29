import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { eq, and, gt, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, ensureDb } from "@/db";
import { users, sessions, pros } from "@/db/schema";

export const SESSION_COOKIE = "bb_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "pro" | "admin";
  avatar: string | null;
  proId: string | null; // set when the user has a pro profile
};

export async function toSessionUser(user: typeof users.$inferSelect): Promise<SessionUser> {
  const [proRow] = await db.select({ id: pros.id }).from(pros).where(eq(pros.userId, user.id)).limit(1);
  return { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, proId: proRow?.id ?? null };
}

const MAX_SESSIONS_PER_USER = 10;

export async function createSession(userId: string): Promise<void> {
  const id = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  // Purge expired sessions and cap concurrent sessions (oldest evicted first).
  await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date().toISOString())));
  const existing = await db
    .select({ id: sessions.id, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.userId, userId));
  if (existing.length >= MAX_SESSIONS_PER_USER) {
    const oldest = existing.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0];
    await db.delete(sessions).where(eq(sessions.id, oldest.id));
  }
  await db.insert(sessions).values({ id, userId, expiresAt });
  setCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession(): Promise<void> {
  await ensureDb();
  const token = getCookie(SESSION_COOKIE);
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

/** "Sign out everywhere" — used on password reset, account deletion, and suspension too. */
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Returns the logged-in user for the current request, or null. Server-side only. */
export async function currentUser(): Promise<SessionUser | null> {
  await ensureDb();
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date().toISOString())))
    .limit(1);
  if (!row || row.user.status !== "active") return null; // suspended/deleted accounts have no session
  return toSessionUser(row.user);
}

/** Throws a 401 if not logged in. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}
