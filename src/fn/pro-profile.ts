import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { pros, services, users } from "@/db/schema";
import { requireUser } from "@/server/session";

export const CRAFTS = [
  { craft: "Barber", category: "barber" },
  { craft: "Hair Stylist", category: "hair" },
  { craft: "Nail Technician", category: "nails" },
  { craft: "Makeup Artist", category: "makeup" },
  { craft: "Lash Technician", category: "lash" },
  { craft: "Esthetician", category: "skin" },
  { craft: "Massage Therapist", category: "massage" },
  { craft: "Brow Artist", category: "brows" },
] as const;

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=80";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop&q=80";

const serviceSchema = z.object({
  name: z.string().trim().min(1).max(80),
  price: z.number().int().min(1).max(10_000),
  mins: z.number().int().min(5).max(600),
});

async function uniqueSlug(name: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "pro";
  let slug = base;
  for (let i = 2; ; i++) {
    const [taken] = await db.select({ id: pros.id }).from(pros).where(eq(pros.id, slug)).limit(1);
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
}

/** Converts the signed-in customer into a pro with a live profile and service menu. */
export const becomePro = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(80),
      craft: z.string(),
      city: z.string().trim().min(1).max(80),
      years: z.number().int().min(0).max(60),
      bio: z.string().trim().max(600).default(""),
      licenseNumber: z.string().trim().max(60).optional(),
      licenseRegion: z.string().trim().max(60).optional(),
      mobile: z.boolean().default(false),
      inShop: z.boolean().default(true),
      services: z.array(serviceSchema).min(1).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    await ensureDb();
    if (user.proId) return { ok: true as const, proId: user.proId, existing: true };

    const craftEntry = CRAFTS.find((c) => c.craft === data.craft);
    if (!craftEntry) return { ok: false as const, error: "Pick a craft from the list." };

    const proId = await uniqueSlug(data.name);
    const certifications = data.licenseNumber
      ? [`${data.licenseRegion ?? "State"} License ${data.licenseNumber} · pending verification`]
      : [];

    await db.insert(pros).values({
      id: proId,
      userId: user.id,
      name: data.name,
      craft: craftEntry.craft,
      category: craftEntry.category,
      city: data.city,
      rating: 5,
      reviewCount: 0,
      years: data.years,
      price: Math.min(...data.services.map((s) => s.price)),
      distance: 1,
      avatar: user.avatar ?? DEFAULT_AVATAR,
      cover: DEFAULT_COVER,
      bio: data.bio,
      tags: [],
      portfolio: [],
      certifications,
      elite: false,
      verified: false, // flips after the trust team reviews the license
      mobile: data.mobile,
      inShop: data.inShop,
    });
    await db.insert(services).values(data.services.map((s) => ({ id: nanoid(), proId, ...s })));
    await db.update(users).set({ role: "pro" }).where(eq(users.id, user.id));
    return { ok: true as const, proId, existing: false };
  });

export const updateProProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      bio: z.string().trim().max(600).optional(),
      city: z.string().trim().min(1).max(80).optional(),
      mobile: z.boolean().optional(),
      inShop: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!user.proId) throw new Response("Not a pro account", { status: 403 });
    await db.update(pros).set(data).where(eq(pros.id, user.proId));
    return { ok: true as const };
  });

export const addService = createServerFn({ method: "POST" })
  .inputValidator(serviceSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!user.proId) throw new Response("Not a pro account", { status: 403 });
    const service = { id: nanoid(), proId: user.proId, ...data };
    await db.insert(services).values(service);
    await syncStartingPrice(user.proId);
    return { ok: true as const, service };
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!user.proId) throw new Response("Not a pro account", { status: 403 });
    const remaining = await db.select({ id: services.id }).from(services).where(eq(services.proId, user.proId));
    if (remaining.length <= 1) return { ok: false as const, error: "Keep at least one service on your menu." };
    await db.delete(services).where(and(eq(services.id, data.id), eq(services.proId, user.proId)));
    await syncStartingPrice(user.proId);
    return { ok: true as const };
  });

async function syncStartingPrice(proId: string) {
  const rows = await db.select({ price: services.price }).from(services).where(eq(services.proId, proId));
  if (rows.length) {
    await db.update(pros).set({ price: Math.min(...rows.map((r) => r.price)) }).where(eq(pros.id, proId));
  }
}
