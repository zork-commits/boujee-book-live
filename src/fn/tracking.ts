import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { bookings, bookingLocations, pros, users } from "@/db/schema";
import { requireUser, type SessionUser } from "@/server/session";
import { allow, RATE_LIMITED_ERROR } from "@/server/rate-limit";

/** Statuses during which live location may be shared and read. */
const ACTIVE = ["confirmed", "en_route", "arrived"] as const;
const isActive = (s: string) => (ACTIVE as readonly string[]).includes(s);

/** Location fixes older than this read as stale ("last seen"). */
export const STALE_AFTER_MS = 2 * 60_000;

async function participantRole(bookingId: string, user: SessionUser) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return { booking: null, role: null } as const;
  if (booking.customerId === user.id) return { booking, role: "customer" as const };
  if (user.proId && booking.proId === user.proId) return { booking, role: "pro" as const };
  return { booking, role: null } as const;
}

export const shareLocation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      bookingId: z.string(),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      accuracy: z.number().min(0).max(100_000).optional(),
      heading: z.number().min(0).max(360).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    await ensureDb();
    if (!allow("share-location", user.id, 30, 60_000)) return { ok: false as const, error: RATE_LIMITED_ERROR };
    const { booking, role } = await participantRole(data.bookingId, user);
    if (!booking || !role) return { ok: false as const, error: "Not your booking." };
    if (!isActive(booking.status)) return { ok: false as const, error: "Location sharing is only on during an active booking." };
    await db
      .insert(bookingLocations)
      .values({
        bookingId: booking.id,
        role,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy ?? null,
        heading: data.heading ?? null,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: [bookingLocations.bookingId, bookingLocations.role],
        set: {
          lat: data.lat,
          lng: data.lng,
          accuracy: data.accuracy ?? null,
          heading: data.heading ?? null,
          updatedAt: new Date().toISOString(),
        },
      });
    return { ok: true as const };
  });

export const stopSharing = createServerFn({ method: "POST" })
  .inputValidator(z.object({ bookingId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const { booking, role } = await participantRole(data.bookingId, user);
    if (!booking || !role) return { ok: false as const };
    await db
      .delete(bookingLocations)
      .where(and(eq(bookingLocations.bookingId, booking.id), eq(bookingLocations.role, role)));
    return { ok: true as const };
  });

/** Everything the tracking screen needs, for either participant. Poll this. */
export const getLiveTracking = createServerFn({ method: "GET" })
  .inputValidator(z.object({ bookingId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    await ensureDb();
    const { booking, role } = await participantRole(data.bookingId, user);
    if (!booking || !role) throw new Response("Not your booking", { status: 403 });
    const [pro] = await db
      .select({ id: pros.id, name: pros.name, avatar: pros.avatar, craft: pros.craft, city: pros.city })
      .from(pros)
      .where(eq(pros.id, booking.proId))
      .limit(1);
    const [customer] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, booking.customerId))
      .limit(1);
    const locations = isActive(booking.status)
      ? await db.select().from(bookingLocations).where(eq(bookingLocations.bookingId, booking.id))
      : [];
    return {
      booking,
      myRole: role,
      pro: pro ?? null,
      customerName: customer?.name ?? "Client",
      proLocation: locations.find((l) => l.role === "pro") ?? null,
      customerLocation: locations.find((l) => l.role === "customer") ?? null,
    };
  });
