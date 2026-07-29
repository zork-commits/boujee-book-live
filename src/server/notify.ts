import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";

type NotifyInput = {
  type: "booking" | "message" | "review" | "verification" | "dispute" | "system";
  title: string;
  body?: string;
  href?: string;
};

/** Fan a notification out to one user. Email/push delivery hooks in here later. */
export async function notify(userId: string, n: NotifyInput): Promise<void> {
  await db.insert(notifications).values({
    id: nanoid(),
    userId,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    href: n.href ?? null,
    readAt: null,
    createdAt: new Date().toISOString(),
  });
}

export async function notifyAdmins(n: NotifyInput): Promise<void> {
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(admins.map((a) => notify(a.id, n)));
}
