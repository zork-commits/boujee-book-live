import { createServerFn } from "@tanstack/react-start";
import { eq, and, gte, lt, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { bookings, users, pros } from "@/db/schema";
import { requireUser } from "@/server/session";

const startOfDay = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const proDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  if (!user.proId) throw new Response("Not a pro account", { status: 403 });
  const proId = user.proId;

  const [profile] = await db.select().from(pros).where(eq(pros.id, proId)).limit(1);

  const today = await db
    .select({
      booking: bookings,
      clientName: users.name,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.customerId, users.id))
    .where(and(eq(bookings.proId, proId), gte(bookings.scheduledAt, startOfDay(0)), lt(bookings.scheduledAt, startOfDay(1))))
    .orderBy(bookings.scheduledAt);

  const earned = (from: string, to: string) =>
    db
      .select({ total: sql<number>`coalesce(sum(${bookings.price}), 0)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.proId, proId),
          sql`${bookings.status} in ('completed', 'confirmed')`,
          gte(bookings.scheduledAt, from),
          lt(bookings.scheduledAt, to),
        ),
      )
      .then(([r]) => r?.total ?? 0);

  const [todayTotal, weekTotal, monthTotal] = await Promise.all([
    earned(startOfDay(0), startOfDay(1)),
    earned(startOfDay(-6), startOfDay(1)),
    earned(startOfDay(-29), startOfDay(1)),
  ]);
  const weekly = await Promise.all(
    Array.from({ length: 7 }, (_, i) => earned(startOfDay(i - 6), startOfDay(i - 5))),
  );

  const topServices = await db
    .select({
      name: bookings.serviceName,
      revenue: sql<number>`sum(${bookings.price})`,
      count: sql<number>`count(*)`,
    })
    .from(bookings)
    .where(and(eq(bookings.proId, proId), eq(bookings.status, "completed")))
    .groupBy(bookings.serviceName)
    .orderBy(desc(sql`sum(${bookings.price})`));

  const clients = await db
    .select({
      id: users.id,
      name: users.name,
      visits: sql<number>`count(*)`,
      spend: sql<number>`sum(${bookings.price})`,
      last: sql<string>`max(${bookings.scheduledAt})`,
      fav: sql<string>`(
        select b2.service_name from bookings b2
        where b2.customer_id = ${users.id} and b2.pro_id = ${proId}
        group by b2.service_name order by count(*) desc limit 1
      )`,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.customerId, users.id))
    .where(and(eq(bookings.proId, proId), sql`${bookings.status} != 'cancelled'`))
    .groupBy(users.id)
    .orderBy(desc(sql`max(${bookings.scheduledAt})`));

  return {
    profile,
    today,
    earnings: { today: todayTotal, week: weekTotal, month: monthTotal, weekly, topServices },
    clients,
  };
});
