import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { users } from "@/db/schema";
import { currentUser, createSession, destroySession, toSessionUser } from "@/server/session";
import { hashPassword, verifyPassword } from "@/server/password";

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
  await destroySession();
  return { ok: true as const };
});
