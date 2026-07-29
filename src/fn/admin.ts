import { createServerFn } from "@tanstack/react-start";
import { eq, ne, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pros, users, bookings, services, disputes, reports, auditLog } from "@/db/schema";
import { requireUser, destroyAllSessions } from "@/server/session";
import { audit } from "@/server/audit";
import { notify } from "@/server/notify";

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
    const admin = await requireAdmin();
    const [pro] = await db.select().from(pros).where(eq(pros.id, data.proId)).limit(1);
    if (!pro) return { ok: false as const, error: "Pro not found." };
    if (data.action === "approve") {
      await db.update(pros).set({ verified: true }).where(eq(pros.id, data.proId));
      if (pro.userId) {
        await notify(pro.userId, {
          type: "verification",
          title: "You're verified",
          body: "Your license passed review — the verified badge is live on your profile.",
          href: "/pro/profile",
        });
      }
    } else {
      // Rejection removes the profile and returns the account to a regular customer.
      await db.delete(services).where(eq(services.proId, data.proId));
      await db.delete(pros).where(eq(pros.id, data.proId));
      if (pro.userId) {
        await db.update(users).set({ role: "customer" }).where(eq(users.id, pro.userId));
        await notify(pro.userId, {
          type: "verification",
          title: "Application not approved",
          body: "We couldn't verify your application. Reply to help@boujeebook.app to appeal.",
          href: "/app",
        });
      }
    }
    await audit(admin.id, `pro.${data.action}`, { type: "pro", id: data.proId }, { name: pro.name });
    return { ok: true as const };
  });

export const adminListUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      bookingCount: sql<number>`(select count(*) from bookings where bookings.customer_id = ${users.id})`,
    })
    .from(users)
    .where(ne(users.status, "deleted"))
    .orderBy(desc(users.createdAt))
    .limit(200);
});

export const adminSetUserStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string(), status: z.enum(["active", "suspended"]) }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (data.userId === admin.id) return { ok: false as const, error: "You can't suspend yourself." };
    const [target] = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
    if (!target) return { ok: false as const, error: "User not found." };
    if (target.role === "admin") return { ok: false as const, error: "Admins can't be suspended from here." };
    await db.update(users).set({ status: data.status }).where(eq(users.id, data.userId));
    if (data.status === "suspended") await destroyAllSessions(data.userId); // kick them out immediately
    await audit(admin.id, `user.${data.status === "suspended" ? "suspend" : "reinstate"}`, { type: "user", id: data.userId }, { email: target.email });
    return { ok: true as const };
  });

export const adminListBookings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
    .select({
      booking: bookings,
      customerName: sql<string>`(select name from users where users.id = ${bookings.customerId})`,
      proName: pros.name,
    })
    .from(bookings)
    .innerJoin(pros, eq(bookings.proId, pros.id))
    .orderBy(desc(bookings.scheduledAt))
    .limit(200);
});

export const adminCancelBooking = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, data.id)).limit(1);
    if (!booking || booking.status === "cancelled") return { ok: false as const, error: "Not cancellable." };
    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, data.id));
    await notify(booking.customerId, {
      type: "booking",
      title: "Booking cancelled by Boujee Book",
      body: `${booking.serviceName} — our team cancelled this booking. You'll hear from support shortly.`,
      href: "/app/bookings",
    });
    const [pro] = await db.select({ userId: pros.userId }).from(pros).where(eq(pros.id, booking.proId)).limit(1);
    if (pro?.userId) {
      await notify(pro.userId, { type: "booking", title: "Booking cancelled by Boujee Book", body: booking.serviceName, href: "/pro/schedule" });
    }
    await audit(admin.id, "booking.force_cancel", { type: "booking", id: data.id });
    return { ok: true as const };
  });

export const adminResolveDispute = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.enum(["resolved", "dismissed"]), resolution: z.string().trim().min(1).max(1000) }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, data.id)).limit(1);
    if (!dispute || dispute.status !== "open") return { ok: false as const, error: "Dispute not open." };
    await db
      .update(disputes)
      .set({ status: data.status, resolution: data.resolution, resolvedAt: new Date().toISOString() })
      .where(eq(disputes.id, data.id));
    await notify(dispute.customerId, {
      type: "dispute",
      title: data.status === "resolved" ? "Your dispute was resolved" : "Dispute update",
      body: data.resolution,
      href: "/app/bookings",
    });
    await audit(admin.id, `dispute.${data.status}`, { type: "dispute", id: data.id });
    return { ok: true as const };
  });

export const adminListReports = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
    .select({
      report: reports,
      reporterName: sql<string>`(select name from users where users.id = ${reports.reporterId})`,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(100);
});

export const adminSetReportStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.enum(["actioned", "dismissed"]) }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    await db.update(reports).set({ status: data.status }).where(eq(reports.id, data.id));
    await audit(admin.id, `report.${data.status}`, { type: "report", id: data.id });
    return { ok: true as const };
  });

export const adminAuditLog = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      metaJson: sql<string | null>`${auditLog.meta}`,
      createdAt: auditLog.createdAt,
      actorName: sql<string>`(select name from users where users.id = ${auditLog.actorId})`,
    })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(50);
});
