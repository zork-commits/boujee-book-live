import { createServerFn } from "@tanstack/react-start";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { pros, services, reviews, users } from "@/db/schema";

export const listPros = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      q: z.string().trim().optional(),
      category: z.string().optional(),
      sort: z.enum(["rating", "price", "distance"]).optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    await ensureDb();
    const filters = [];
    if (data?.category) filters.push(eq(pros.category, data.category));
    if (data?.q) {
      const q = `%${data.q}%`;
      filters.push(or(like(pros.name, q), like(pros.craft, q), like(pros.city, q), like(pros.tags, q)));
    }
    const orderBy =
      data?.sort === "price" ? pros.price : data?.sort === "distance" ? pros.distance : desc(pros.rating);
    return db
      .select()
      .from(pros)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(orderBy);
  });

export const getPro = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await ensureDb();
    const [pro] = await db.select().from(pros).where(eq(pros.id, data.id)).limit(1);
    if (!pro) return null;
    const proServices = await db.select().from(services).where(eq(services.proId, pro.id));
    const proReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        reviewer: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.proId, pro.id))
      .orderBy(desc(reviews.createdAt))
      .limit(20);
    return { ...pro, services: proServices, reviews: proReviews };
  });

export const getCategoryCounts = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDb();
  return db
    .select({ category: pros.category, count: sql<number>`count(*)`, minPrice: sql<number>`min(${pros.price})` })
    .from(pros)
    .groupBy(pros.category);
});
