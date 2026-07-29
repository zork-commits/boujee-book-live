import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["customer", "pro", "admin"] }).notNull().default("customer"),
  status: text("status", { enum: ["active", "suspended", "deleted"] }).notNull().default("active"),
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
  status: text("status", { enum: ["pending", "confirmed", "en_route", "arrived", "completed", "cancelled"] }).notNull().default("pending"),
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

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // booking | message | review | verification | dispute | system
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"), // in-app destination
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
});

export const disputes = sqliteTable("disputes", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  customerId: text("customer_id").notNull().references(() => users.id),
  proId: text("pro_id").notNull().references(() => pros.id),
  reason: text("reason").notNull(),
  details: text("details").notNull(),
  status: text("status", { enum: ["open", "resolved", "dismissed"] }).notNull().default("open"),
  resolution: text("resolution"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});

export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull(),
});

/** Weekly working hours; one row per pro per day-of-week (0=Sunday). */
export const proHours = sqliteTable(
  "pro_hours",
  {
    proId: text("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
    dow: integer("dow").notNull(), // 0-6
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    startMin: integer("start_min").notNull().default(9 * 60),
    endMin: integer("end_min").notNull().default(19 * 60),
  },
  (t) => [primaryKey({ columns: [t.proId, t.dow] })],
);

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").notNull().references(() => users.id),
  targetType: text("target_type", { enum: ["pro", "user", "review", "message", "conversation"] }).notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", { enum: ["open", "actioned", "dismissed"] }).notNull().default("open"),
  createdAt: text("created_at").notNull(),
});

export const blocks = sqliteTable(
  "blocks",
  {
    blockerId: text("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    blockedUserId: text("blocked_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedUserId] })],
);

/**
 * Live location during an active booking — one row per participant, upserted.
 * Rows are deleted when the booking completes or cancels; this is ephemeral data.
 */
export const bookingLocations = sqliteTable(
  "booking_locations",
  {
    bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["customer", "pro"] }).notNull(),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    accuracy: real("accuracy"),
    heading: real("heading"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.bookingId, t.role] })],
);

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
export type ProHours = typeof proHours.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Pro = typeof pros.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
