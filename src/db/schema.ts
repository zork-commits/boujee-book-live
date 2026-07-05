import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["customer", "pro", "admin"] }).notNull().default("customer"),
  avatar: text("avatar"),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
});

export const pros = sqliteTable("pros", {
  id: text("id").primaryKey(), // slug, e.g. "amara-cole"
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  craft: text("craft").notNull(),
  category: text("category").notNull(), // matches CATEGORIES keys
  city: text("city").notNull(),
  rating: real("rating").notNull().default(5),
  reviewCount: integer("review_count").notNull().default(0),
  years: integer("years").notNull().default(0),
  price: integer("price").notNull(), // starting price in dollars
  distance: real("distance").notNull().default(0),
  avatar: text("avatar").notNull(),
  cover: text("cover").notNull(),
  bio: text("bio").notNull().default(""),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  portfolio: text("portfolio", { mode: "json" }).$type<string[]>().notNull().default([]),
  certifications: text("certifications", { mode: "json" }).$type<string[]>().notNull().default([]),
  elite: integer("elite", { mode: "boolean" }).notNull().default(false),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  mobile: integer("mobile", { mode: "boolean" }).notNull().default(false),
  inShop: integer("in_shop", { mode: "boolean" }).notNull().default(true),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  proId: text("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  mins: integer("mins").notNull(),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => users.id),
  proId: text("pro_id").notNull().references(() => pros.id),
  serviceId: text("service_id").references(() => services.id),
  serviceName: text("service_name").notNull(),
  price: integer("price").notNull(),
  mins: integer("mins").notNull(),
  scheduledAt: text("scheduled_at").notNull(), // ISO datetime
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).notNull().default("pending"),
  location: text("location", { enum: ["mobile", "shop"] }).notNull().default("shop"),
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => users.id),
  proId: text("pro_id").notNull().references(() => pros.id),
  lastMessageAt: text("last_message_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  customerId: text("customer_id").notNull().references(() => users.id),
  proId: text("pro_id").notNull().references(() => pros.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").notNull(),
});

export const favorites = sqliteTable(
  "favorites",
  {
    customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    proId: text("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.customerId, t.proId] })],
);

export type User = typeof users.$inferSelect;
export type Pro = typeof pros.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
