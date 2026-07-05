import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc, asc, gte, lt, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { bookings, services, pros, reviews } from "@/db/schema";
import { requireUser } from "./auth";

const proSummary = {
  proId: pros.id,
  proName: pros.name,
  proCraft: pros.craft,
  proCity: pros.city,
  proAvatar: pros.avatar,
  proCover: pros.cover,
  proRating: pros.rating,
};

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      proId: z.string(),
      serviceId: z.string(),
      scheduledAt: z.string().datetime(),
      location: z.enum(["mobile", "shop"]).default("shop"),
      address: z.string().max(300).optional(),
      notes: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    // Price and duration come from the service row — never from the client.
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, data.serviceId), eq(services.proId, data.proId)))
      .limit(1);
    if (!service) return { ok: false as const, error: "Service not found." };
    if (new Date(data.scheduledAt).getTime() < Date.now()) {
      return { ok: false as const, error: "Pick a time in the future." };
    }
    const booking = {
      id: nanoid(),
      customerId: user.id,
      proId: data.proId,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      mins: service.mins,
      scheduledAt: data.scheduledAt,
      status: "pending" as const,
      location: data.location,
      address: data.address ?? null,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    await db.insert(bookings).values(booking);
    return { ok: true as const, booking };
  });

export const myBookings = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const rows = await db
    .select({ booking: bookings, ...proSummary })
    .from(bookings)
    .innerJoin(pros, eq(bookings.proId, pros.id))
    .where(eq(bookings.customerId, user.id))
    .orderBy(desc(bookings.scheduledAt));
  const nowIso = new Date().toISOString();
  return {
    upcoming: rows.filter((r) => r.booking.scheduledAt >= nowIso && r.booking.status !== "cancelled").reverse(),
    past: rows.filter((r) => r.booking.scheduledAt < nowIso || r.booking.status === "cancelled"),
  };
});

export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const result = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.id, data.id), eq(bookings.customerId, user.id)));
    return { ok: result.rowsAffected > 0 };
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator(z.object({ bookingId: z.string(), rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, data.bookingId), eq(bookings.customerId, user.id)))
      .limit(1);
    if (!booking) return { ok: false as const, error: "Booking not found." };
    const [existing] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.bookingId, booking.id)).limit(1);
    if (existing) return { ok: false as const, error: "Already reviewed." };
    await db.insert(reviews).values({
      id: nanoid(),
      bookingId: booking.id,
      customerId: user.id,
      proId: booking.proId,
      rating: data.rating,
      comment: data.comment ?? null,
      createdAt: new Date().toISOString(),
    });
    // Refresh the pro's aggregate rating.
    const [agg] = await db
      .select({ avg: sql<number>`avg(${reviews.rating})`, count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.proId, booking.proId));
    if (agg) {
      await db
        .update(pros)
        .set({ rating: Math.round(agg.avg * 100) / 100, reviewCount: agg.count })
        .where(eq(pros.id, booking.proId));
    }
    return { ok: true as const };
  });

/** Pro-side: bookings on the authed pro's calendar for a given day range. */
export const proBookings = createServerFn({ method: "GET" })
  .inputValidator(z.object({ from: z.string(), to: z.string() }).optional())
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!user.proId) throw new Response("Not a pro account", { status: 403 });
    const filters = [eq(bookings.proId, user.proId)];
    if (data?.from) filters.push(gte(bookings.scheduledAt, data.from));
    if (data?.to) filters.push(lt(bookings.scheduledAt, data.to));
    return db
      .select({
        booking: bookings,
        clientName: sql<string>`(select name from users where users.id = ${bookings.customerId})`,
      })
      .from(bookings)
      .where(and(...filters))
      .orderBy(asc(bookings.scheduledAt));
  });

/** Pro-side: confirm/complete/cancel a booking on their own calendar. */
export const setBookingStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.enum(["confirmed", "completed", "cancelled"]) }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!user.proId) throw new Response("Not a pro account", { status: 403 });
    const result = await db
      .update(bookings)
      .set({ status: data.status })
      .where(and(eq(bookings.id, data.id), eq(bookings.proId, user.proId)));
    return { ok: result.rowsAffected > 0 };
  });
