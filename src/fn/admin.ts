import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pros, users, bookings, services } from "@/db/schema";
import { requireUser } from "@/server/session";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Response("Forbidden", { status: 403 });
  return user;
}

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const [proRows, pending, userCount, bookingAgg] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pros).where(eq(pros.verified, true)),
    db.select().from(pros).where(eq(pros.verified, false)),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db
      .select({
        count: sql<number>`count(*)`,
        gmv: sql<number>`coalesce(sum(case when status != 'cancelled' then price else 0 end), 0)`,
      })
      .from(bookings),
  ]);
  return {
    activePros: proRows[0]?.count ?? 0,
    pendingPros: pending,
    users: userCount[0]?.count ?? 0,
    bookings: bookingAgg[0]?.count ?? 0,
    gmv: bookingAgg[0]?.gmv ?? 0,
  };
});

export const adminListPros = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
    .select({
      pro: pros,
      email: sql<string | null>`(select email from users where users.id = ${pros.userId})`,
    })
    .from(pros)
    .orderBy(pros.verified, pros.name);
});

export const adminSetVerification = createServerFn({ method: "POST" })
  .inputValidator(z.object({ proId: z.string(), action: z.enum(["approve", "reject"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const [pro] = await db.select().from(pros).where(eq(pros.id, data.proId)).limit(1);
    if (!pro) return { ok: false as const, error: "Pro not found." };
    if (data.action === "approve") {
      await db.update(pros).set({ verified: true }).where(eq(pros.id, data.proId));
    } else {
      // Rejection removes the profile and returns the account to a regular customer.
      await db.delete(services).where(eq(services.proId, data.proId));
      await db.delete(pros).where(eq(pros.id, data.proId));
      if (pro.userId) await db.update(users).set({ role: "customer" }).where(eq(users.id, pro.userId));
    }
    return { ok: true as const };
  });
