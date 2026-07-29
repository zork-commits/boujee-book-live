import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "node:crypto";
import { eq, and, gt, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { currentUser, createSession, destroySession, destroyAllSessions, toSessionUser } from "@/server/session";
import { hashPassword, verifyPassword } from "@/server/password";
import { allow, clientIp, RATE_LIMITED_ERROR } from "@/server/rate-limit";

export type { SessionUser } from "@/server/session";

export const getMe = createServerFn({ method: "GET" }).handler(async () => currentUser());

const credentialsSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signup = createServerFn({ method: "POST" })
  .inputValidator(credentialsSchema.extend({ name: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    await ensureDb();
    if (!allow("signup", clientIp(), 5, 15 * 60_000)) return { ok: false as const, error: RATE_LIMITED_ERROR };
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (existing) return { ok: false as const, error: "An account with that email already exists." };
    const user = {
      id: nanoid(),
      email: data.email,
      passwordHash: hashPassword(data.password),
      name: data.name,
      role: "customer" as const,
      status: "active" as const,
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
    // Two buckets: per-IP (broad sweep) and per-account (targeted brute force).
    if (!allow("login-ip", clientIp(), 20, 15 * 60_000) || !allow("login-email", data.email, 8, 15 * 60_000)) {
      return { ok: false as const, error: RATE_LIMITED_ERROR };
    }
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    if (user.status === "suspended") return { ok: false as const, error: "This account is suspended. Contact help@boujeebook.app." };
    if (user.status === "deleted") return { ok: false as const, error: "Invalid email or password." };
    await createSession(user.id);
    return { ok: true as const, user: await toSessionUser(user) };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();
  return { ok: true as const };
});

const RESET_TTL_MS = 15 * 60_000;
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Always returns ok — never reveals whether the email exists. */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email().transform((e) => e.toLowerCase().trim()) }))
  .handler(async ({ data }) => {
    await ensureDb();
    if (!allow("reset-ip", clientIp(), 5, 15 * 60_000) || !allow("reset-email", data.email, 3, 15 * 60_000)) {
      return { ok: true as const }; // rate-limited silently: same response as success
    }
    const [user] = await db.select().from(users).where(and(eq(users.email, data.email), eq(users.status, "active"))).limit(1);
    if (user) {
      const token = randomBytes(32).toString("hex");
      await db.insert(passwordResets).values({
        id: nanoid(),
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString(),
        usedAt: null,
        createdAt: new Date().toISOString(),
      });
      // EMAIL STUB: swap for the transactional email provider (Resend/Postmark).
      // Until then the link is printed to the server log so operators can assist.
      console.log(`[password-reset] ${user.email}: /reset?token=${token}`);
    }
    return { ok: true as const };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(32), password: z.string().min(8) }))
  .handler(async ({ data }) => {
    await ensureDb();
    if (!allow("reset-verify", clientIp(), 10, 15 * 60_000)) return { ok: false as const, error: RATE_LIMITED_ERROR };
    const [row] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.tokenHash, sha256(data.token)),
          gt(passwordResets.expiresAt, new Date().toISOString()),
          isNull(passwordResets.usedAt),
        ),
      )
      .limit(1);
    if (!row) return { ok: false as const, error: "That reset link is invalid or expired — request a new one." };
    await db.update(passwordResets).set({ usedAt: new Date().toISOString() }).where(eq(passwordResets.id, row.id));
    await db.update(users).set({ passwordHash: hashPassword(data.password) }).where(eq(users.id, row.userId));
    await destroyAllSessions(row.userId); // invalidate every existing session
    return { ok: true as const };
  });
