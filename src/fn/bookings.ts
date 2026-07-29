import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc, asc, gte, lt, ne, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { bookings, services, pros, reviews, proHours } from "@/db/schema";
import { requireUser } from "@/server/session";
import { notify } from "@/server/notify";
import { allow, RATE_LIMITED_ERROR } from "@/server/rate-limit";

const proSummary = {
  proId: pros.id,
  proName: pros.name,
  proCraft: pros.craft,
  proCity: pros.city,
  proAvatar: pros.avatar,
  proCover: pros.cover,
  proRating: pros.rating,
};

/** Pending bookings whose start time has passed were never confirmed — sweep them to cancelled. */
async function expireStalePending() {
  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(and(eq(bookings.status, "pending"), lt(bookings.scheduledAt, new Date().toISOString())));
}

/** True when [startIso, startIso+mins] fits the pro's working hours and overlaps no other booking. */
async function slotIsBookable(proId: string, startIso: string, mins: number, ignoreBookingId?: string) {
  const start = new Date(startIso);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = startMin + mins;
  const [hours] = await db
    .select()
    .from(proHours)
    .where(and(eq(proHours.proId, proId), eq(proHours.dow, start.getDay())))
    .limit(1);
  if (!hours || !hours.enabled || startMin < hours.startMin || endMin > hours.endMin) {
    return { ok: false, reason: "Outside this pro's working hours." };
  }
  const dayStart = new Date(start); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
  const sameDay = await db
    .select({ id: bookings.id, scheduledAt: bookings.scheduledAt, mins: bookings.mins })
    .from(bookings)
    .where(
      and(
        eq(bookings.proId, proId),
        ne(bookings.status, "cancelled"),
        gte(bookings.scheduledAt, dayStart.toISOString()),
        lt(bookings.scheduledAt, dayEnd.toISOString()),
      ),
    );
  const newStart = start.getTime();
  const newEnd = newStart + mins * 60_000;
  for (const b of sameDay) {
    if (ignoreBookingId && b.id === ignoreBookingId) continue;
    const s = new Date(b.scheduledAt).getTime();
    const e = s + b.mins * 60_000;
    if (s < newEnd && newStart < e) return { ok: false, reason: "That time was just taken — pick another slot." };
  }
  return { ok: true as const };
}

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
    if (!allow("create-booking", user.id, 20, 3600_000)) return { ok: false as const, error: RATE_LIMITED_ERROR };
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
    const slot = await slotIsBookable(data.proId, data.scheduledAt, service.mins);
    if (!slot.ok) return { ok: false as const, error: slot.reason! };
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
    const [pro] = await db.select({ userId: pros.userId, name: pros.name }).from(pros).where(eq(pros.id, data.proId)).limit(1);
    if (pro?.userId) {
      await notify(pro.userId, {
        type: "booking",
        title: "New booking request",
        body: `${user.name} · ${service.name} · ${new Date(data.scheduledAt).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}`,
        href: "/pro",
      });
    }
    return { ok: true as const, booking };
  });

export const myBookings = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  await expireStalePending();
  const rows = await db
    .select({
      booking: bookings,
      ...proSummary,
      myRating: sql<number | null>`(select rating from reviews where reviews.booking_id = ${bookings.id})`,
    })
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
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, data.id), eq(bookings.customerId, user.id)))
      .limit(1);
    if (!booking || booking.status === "cancelled") return { ok: false };
    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, booking.id));
    const [pro] = await db.select({ userId: pros.userId }).from(pros).where(eq(pros.id, booking.proId)).limit(1);
    if (pro?.userId) {
      await notify(pro.userId, {
        type: "booking",
        title: "Booking cancelled",
        body: `${user.name} cancelled ${booking.serviceName} (${new Date(booking.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
        href: "/pro/schedule",
      });
    }
    return { ok: true };
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
    const [proRow] = await db.select({ userId: pros.userId }).from(pros).where(eq(pros.id, booking.proId)).limit(1);
    if (proRow?.userId) {
      await notify(proRow.userId, {
        type: "review",
        title: `New ${data.rating}-star review`,
        body: `${user.name} rated ${booking.serviceName}`,
        href: "/pro/profile",
      });
    }
    return { ok: true as const };
  });

/** Times a service can start on a given day, respecting working hours + existing bookings. */
export const bookableSlots = createServerFn({ method: "GET" })
  .inputValidator(z.object({ proId: z.string(), serviceId: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
  .handler(async ({ data }) => {
    await ensureDb();
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, data.serviceId), eq(services.proId, data.proId)))
      .limit(1);
    if (!service) return { slots: [] as string[] };
    const slots: string[] = [];
    for (let min = 8 * 60; min <= 20 * 60; min += 30) {
      const start = new Date(`${data.date}T00:00:00`);
      start.setMinutes(min);
      if (start.getTime() < Date.now()) continue;
      const check = await slotIsBookable(data.proId, start.toISOString(), service.mins);
      if (check.ok) {
        slots.push(`${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`);
      }
    }
    return { slots };
  });

/** Pro-side: bookings on the authed pro's calendar for a given day range. */
export const proBookings = createServerFn({ method: "GET" })
  .inputValidator(z.object({ from: z.string(), to: z.string() }).optional())
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!user.proId) throw new Response("Not a pro account", { status: 403 });
    await expireStalePending();
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
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, data.id), eq(bookings.proId, user.proId)))
      .limit(1);
    if (!booking) return { ok: false };
    await db.update(bookings).set({ status: data.status }).where(eq(bookings.id, booking.id));
    const titles = { confirmed: "Booking confirmed", completed: "Appointment completed", cancelled: "Booking declined" } as const;
    await notify(booking.customerId, {
      type: "booking",
      title: titles[data.status],
      body: `${booking.serviceName} · ${new Date(booking.scheduledAt).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}`,
      href: data.status === "completed" ? "/app/bookings" : "/app/tracking",
    });
    return { ok: true };
  });
