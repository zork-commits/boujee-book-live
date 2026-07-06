import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { favorites, pros } from "@/db/schema";
import { requireUser } from "@/server/session";

export const myFavorites = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const rows = await db
    .select({ pro: pros })
    .from(favorites)
    .innerJoin(pros, eq(favorites.proId, pros.id))
    .where(eq(favorites.customerId, user.id));
  return rows.map((r) => r.pro);
});

export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ proId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const where = and(eq(favorites.customerId, user.id), eq(favorites.proId, data.proId));
    const [existing] = await db.select().from(favorites).where(where).limit(1);
    if (existing) {
      await db.delete(favorites).where(where);
      return { favorited: false };
    }
    await db.insert(favorites).values({ customerId: user.id, proId: data.proId, createdAt: new Date().toISOString() });
    return { favorited: true };
  });
