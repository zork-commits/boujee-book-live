import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@/db";
import { disputes, bookings, pros, users } from "@/db/schema";
import { requireUser } from "@/server/session";
import { notifyAdmins, notify } from "@/server/notify";
import { allow, clientIp, RATE_LIMITED_ERROR } from "@/server/rate-limit";

export const submitDispute = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      bookingId: z.string(),
      reason: z.string().trim().min(1).max(80),
      details: z.string().trim().min(1).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!allow("dispute", user.id, 5, 24 * 3600_000)) return { ok: false as const, error: RATE_LIMITED_ERROR };
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, data.bookingId), eq(bookings.customerId, user.id)))
      .limit(1);
    if (!booking) return { ok: false as const, error: "Booking not found." };
    const [existing] = await db
      .select({ id: disputes.id })
      .from(disputes)
      .where(and(eq(disputes.bookingId, booking.id), eq(disputes.status, "open")))
      .limit(1);
    if (existing) return { ok: false as const, error: "There's already an open dispute for this booking." };
    const dispute = {
      id: nanoid(),
      bookingId: booking.id,
      customerId: user.id,
      proId: booking.proId,
      reason: data.reason,
      details: data.details,
      status: "open" as const,
      resolution: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    await db.insert(disputes).values(dispute);
    await notifyAdmins({
      type: "dispute",
      title: `New dispute: ${data.reason}`,
      body: `${user.name} · booking ${booking.serviceName} · $${booking.price}`,
      href: "/admin",
    });
    return { ok: true as const, dispute };
  });

export const myDisputes = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return db
    .select({ dispute: disputes, proName: pros.name })
    .from(disputes)
    .innerJoin(pros, eq(disputes.proId, pros.id))
    .where(eq(disputes.customerId, user.id))
    .orderBy(desc(disputes.createdAt));
});

export const adminListDisputes = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  if (user.role !== "admin") throw new Response("Forbidden", { status: 403 });
  return db
    .select({
      dispute: disputes,
      customerName: users.name,
      proName: pros.name,
      serviceName: bookings.serviceName,
      amount: bookings.price,
    })
    .from(disputes)
    .innerJoin(users, eq(disputes.customerId, users.id))
    .innerJoin(pros, eq(disputes.proId, pros.id))
    .innerJoin(bookings, eq(disputes.bookingId, bookings.id))
    .orderBy(desc(disputes.createdAt));
});
