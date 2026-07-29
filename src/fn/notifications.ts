import { createServerFn } from "@tanstack/react-start";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/server/session";

export const myNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
});

export const unreadCount = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  return row?.count ?? 0;
});

export const markAllRead = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  return { ok: true as const };
});
