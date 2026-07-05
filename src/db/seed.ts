import { nanoid } from "nanoid";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { PROS } from "@/lib/mock";
import { hashPassword } from "@/server/password";

type Db = LibSQLDatabase<typeof schema>;

const CRAFT_TO_CATEGORY: Record<string, string> = {
  "Hair Stylist": "hair",
  Barber: "barber",
  "Nail Technician": "nails",
  "Makeup Artist": "makeup",
  "Lash Technician": "lash",
  "Massage Therapist": "massage",
  Esthetician: "skin",
};

const iso = (d: Date) => d.toISOString();
const daysFromNow = (days: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return iso(d);
};

export async function seedIfEmpty(db: Db) {
  const existing = await db.select({ id: schema.pros.id }).from(schema.pros).limit(1);
  if (existing.length > 0) return;

  const now = iso(new Date());
  const password = hashPassword("boujee123");

  // Demo accounts — documented in README for the launch checklist.
  const demoCustomer = { id: nanoid(), email: "demo@boujeebook.app", passwordHash: password, name: "Maya Reyes", role: "customer" as const, avatar: null, createdAt: now };
  const proUser = { id: nanoid(), email: "marcus@boujeebook.app", passwordHash: password, name: "Marcus Vega", role: "pro" as const, avatar: null, createdAt: now };
  const adminUser = { id: nanoid(), email: "admin@boujeebook.app", passwordHash: password, name: "Boujee Admin", role: "admin" as const, avatar: null, createdAt: now };

  const clientNames = ["Devon Hayes", "Aiden Cho", "Marcus Tate", "Jamal Brooks", "Owen Park"];
  const clients = clientNames.map((name) => ({
    id: nanoid(),
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    passwordHash: password,
    name,
    role: "customer" as const,
    avatar: null,
    createdAt: now,
  }));

  await db.insert(schema.users).values([demoCustomer, proUser, adminUser, ...clients]);

  await db.insert(schema.pros).values(
    PROS.map((p) => ({
      id: p.id,
      userId: p.id === "marcus-vega" ? proUser.id : null,
      name: p.name,
      craft: p.craft,
      category: CRAFT_TO_CATEGORY[p.craft] ?? "hair",
      city: p.city,
      rating: p.rating,
      reviewCount: p.reviews,
      years: p.years,
      price: p.price,
      distance: p.distance,
      avatar: p.avatar,
      cover: p.cover,
      bio: p.bio,
      tags: p.tags,
      portfolio: p.portfolio,
      certifications: p.certifications,
      elite: !!p.elite,
      verified: !!p.verified,
      mobile: p.mobile,
      inShop: p.inShop,
    })),
  );

  const serviceRows = PROS.flatMap((p) =>
    p.services.map((s) => ({ id: nanoid(), proId: p.id, name: s.name, price: s.price, mins: s.mins })),
  );
  await db.insert(schema.services).values(serviceRows);
  const serviceId = (proId: string, name: string) => serviceRows.find((s) => s.proId === proId && s.name === name)?.id ?? null;

  // Upcoming + past bookings for the demo customer.
  const customerBookings = [
    { proId: "amara-cole", serviceName: "Cut & Style", price: 140, mins: 60, scheduledAt: daysFromNow(0, 16, 30), status: "confirmed" as const },
    { proId: "saiko-tanaka", serviceName: "Gel-X Full Set", price: 95, mins: 75, scheduledAt: daysFromNow(4, 11), status: "confirmed" as const },
    { proId: "marcus-vega", serviceName: "Signature Cut", price: 75, mins: 45, scheduledAt: daysFromNow(-23, 14), status: "completed" as const },
    { proId: "rio-fernandez", serviceName: "Volume Set", price: 260, mins: 150, scheduledAt: daysFromNow(-32, 10), status: "completed" as const },
    { proId: "leila-okafor", serviceName: "Soft Glam", price: 220, mins: 75, scheduledAt: daysFromNow(-44, 17), status: "completed" as const },
  ].map((b) => ({
    id: nanoid(),
    customerId: demoCustomer.id,
    serviceId: serviceId(b.proId, b.serviceName),
    location: "shop" as const,
    address: null,
    notes: null,
    createdAt: now,
    ...b,
  }));

  // Today's schedule + history for Marcus (the demo pro), so the pro dashboard has real data.
  const todaySlots: [number, number, string, string, number, number, "confirmed" | "pending"][] = [
    [10, 0, clients[0].id, "Skin Fade + Beard", 110, 60, "confirmed"],
    [11, 30, clients[1].id, "Signature Cut", 75, 45, "confirmed"],
    [13, 0, clients[2].id, "Hot Towel Shave", 65, 30, "pending"],
    [14, 30, clients[3].id, "Signature Cut", 75, 45, "confirmed"],
    [16, 0, clients[4].id, "Skin Fade + Beard", 110, 60, "confirmed"],
  ];
  const proBookings = todaySlots.map(([h, m, customerId, serviceName, price, mins, status]) => ({
    id: nanoid(),
    customerId,
    proId: "marcus-vega",
    serviceId: serviceId("marcus-vega", serviceName),
    serviceName,
    price,
    mins,
    scheduledAt: daysFromNow(0, h, m),
    status,
    location: "shop" as const,
    address: null,
    notes: null,
    createdAt: now,
  }));
  const proHistory = Array.from({ length: 28 }, (_, i) => {
    const client = clients[i % clients.length];
    const svc = ["Signature Cut", "Skin Fade + Beard", "Hot Towel Shave"][i % 3];
    const price = { "Signature Cut": 75, "Skin Fade + Beard": 110, "Hot Towel Shave": 65 }[svc]!;
    return {
      id: nanoid(),
      customerId: client.id,
      proId: "marcus-vega",
      serviceId: serviceId("marcus-vega", svc),
      serviceName: svc,
      price,
      mins: svc === "Hot Towel Shave" ? 30 : svc === "Signature Cut" ? 45 : 60,
      scheduledAt: daysFromNow(-(i + 1), 10 + (i % 6)),
      status: "completed" as const,
      location: "shop" as const,
      address: null,
      notes: null,
      createdAt: now,
    };
  });

  await db.insert(schema.bookings).values([...customerBookings, ...proBookings, ...proHistory]);

  // A seeded conversation so Messages isn't empty on first login.
  const convo = { id: nanoid(), customerId: demoCustomer.id, proId: "amara-cole", lastMessageAt: now };
  await db.insert(schema.conversations).values([convo]);
  await db.insert(schema.messages).values([
    { id: nanoid(), conversationId: convo.id, senderId: demoCustomer.id, body: "Hi Amara! Excited for my appointment — should I come with my hair washed?", createdAt: daysFromNow(-1, 9) },
    { id: nanoid(), conversationId: convo.id, senderId: demoCustomer.id, body: "Also thinking about going a shade warmer this time.", createdAt: daysFromNow(-1, 9, 2) },
  ]);

  // Reviews on the demo customer's completed bookings.
  const completed = customerBookings.filter((b) => b.status === "completed");
  await db.insert(schema.reviews).values(
    completed.map((b, i) => ({
      id: nanoid(),
      bookingId: b.id,
      customerId: demoCustomer.id,
      proId: b.proId,
      rating: i === 2 ? 4 : 5,
      comment: ["Clean fade, zero wait. Best in the city.", "Lashes still perfect two weeks later.", "Gorgeous glam, slightly late start."][i] ?? null,
      createdAt: now,
    })),
  );

  // Demo favorites.
  await db.insert(schema.favorites).values(
    ["amara-cole", "saiko-tanaka", "rio-fernandez", "marcus-vega"].map((proId) => ({
      customerId: demoCustomer.id,
      proId,
      createdAt: now,
    })),
  );
}
