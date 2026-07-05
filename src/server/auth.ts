import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { users, sessions, pros } from "@/db/schema";
import { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "bb_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "pro" | "admin";
  avatar: string | null;
  proId: string | null; // set when the user has a pro profile
};

async function toSessionUser(user: typeof users.$inferSelect): Promise<SessionUser> {
  const [proRow] = await db.select({ id: pros.id }).from(pros).where(eq(pros.userId, user.id)).limit(1);
  return { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, proId: proRow?.id ?? null };
}

async function createSession(userId: string): Promise<void> {
  const id = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  await db.insert(sessions).values({ id, userId, expiresAt });
  setCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
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
  return row ? toSessionUser(row.user) : null;
}

/** Throws a 401 if not logged in. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export const getMe = createServerFn({ method: "GET" }).handler(async () => currentUser());

const credentialsSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signup = createServerFn({ method: "POST" })
  .inputValidator(credentialsSchema.extend({ name: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    await ensureDb();
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (existing) return { ok: false as const, error: "An account with that email already exists." };
    const user = {
      id: nanoid(),
      email: data.email,
      passwordHash: hashPassword(data.password),
      name: data.name,
      role: "customer" as const,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    await db.insert(users).values(user);
    await createSession(user.id);
    return { ok: true as const, user: await toSessionUser(user) };
  });

export const login = createServerFn({ method: "POST" })
  .inputValidator(credentialsSchema)
  .handler(async ({ data }) => {
    await ensureDb();
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    await createSession(user.id);
    return { ok: true as const, user: await toSessionUser(user) };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await ensureDb();
  const token = getCookie(SESSION_COOKIE);
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true as const };
});
