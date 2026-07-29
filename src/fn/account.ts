import { createServerFn } from "@tanstack/react-start";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, bookings, reviews, favorites, messages, conversations, pros, services, notifications } from "@/db/schema";
import { requireUser, destroyAllSessions } from "@/server/session";
import { verifyPassword, hashPassword } from "@/server/password";
import { audit } from "@/server/audit";
import { nanoid } from "nanoid";

/** GDPR/CCPA data export — everything we hold about the signed-in user, as JSON. */
export const exportMyData = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const [profile] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const { passwordHash: _omit, ...safeProfile } = profile!;
  const [myBookings, myReviews, myFavorites, myConversations] = await Promise.all([
    db.select().from(bookings).where(eq(bookings.customerId, user.id)),
    db.select().from(reviews).where(eq(reviews.customerId, user.id)),
    db.select().from(favorites).where(eq(favorites.customerId, user.id)),
    db.select().from(conversations).where(eq(conversations.customerId, user.id)),
  ]);
  const myMessages = await db.select().from(messages).where(eq(messages.senderId, user.id));
  const proProfile = user.proId
    ? (await db.select().from(pros).where(eq(pros.id, user.proId)).limit(1))[0]
    : null;
  await audit(user.id, "account.export", { type: "user", id: user.id });
  return {
    exportedAt: new Date().toISOString(),
    profile: safeProfile,
    proProfile,
    bookings: myBookings,
    reviews: myReviews,
    favorites: myFavorites,
    conversations: myConversations,
    messages: myMessages,
  };
});

export const updateMyName = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    await db.update(users).set({ name: data.name }).where(eq(users.id, user.id));
    return { ok: true as const };
  });

export const signOutEverywhere = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireUser();
  await destroyAllSessions(user.id);
  return { ok: true as const };
});

/**
 * Account deletion (Apple 5.1.1(v) / GDPR art. 17).
 * PII is erased; booking/review rows are anonymized rather than deleted so pros'
 * financial history stays intact (legitimate-interest retention).
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const [row] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!row || !verifyPassword(data.password, row.passwordHash)) {
      return { ok: false as const, error: "Password is incorrect." };
    }
    if (user.proId) {
      await db.delete(services).where(eq(services.proId, user.proId));
      await db.delete(pros).where(eq(pros.id, user.proId));
    }
    await db.delete(favorites).where(eq(favorites.customerId, user.id));
    await db.delete(notifications).where(eq(notifications.userId, user.id));
    await db.update(messages).set({ body: "[deleted]" }).where(eq(messages.senderId, user.id));
    await db.update(reviews).set({ comment: null }).where(eq(reviews.customerId, user.id));
    await db
      .update(users)
      .set({
        name: "Deleted user",
        email: `deleted-${nanoid(10)}@deleted.boujeebook.app`,
        passwordHash: hashPassword(nanoid(24)),
        avatar: null,
        status: "deleted",
        role: "customer",
      })
      .where(eq(users.id, user.id));
    await destroyAllSessions(user.id);
    await audit(user.id, "account.delete", { type: "user", id: user.id });
    return { ok: true as const };
  });
