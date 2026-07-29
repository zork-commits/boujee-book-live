import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@/db";
import { reports, blocks } from "@/db/schema";
import { requireUser } from "@/server/session";
import { notifyAdmins } from "@/server/notify";
import { allow, RATE_LIMITED_ERROR } from "@/server/rate-limit";

export const reportContent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      targetType: z.enum(["pro", "user", "review", "message", "conversation"]),
      targetId: z.string(),
      reason: z.string().trim().min(1).max(80),
      details: z.string().trim().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (!allow("report", user.id, 10, 24 * 3600_000)) return { ok: false as const, error: RATE_LIMITED_ERROR };
    await db.insert(reports).values({
      id: nanoid(),
      reporterId: user.id,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      details: data.details ?? null,
      status: "open",
      createdAt: new Date().toISOString(),
    });
    await notifyAdmins({
      type: "system",
      title: `Content reported: ${data.targetType}`,
      body: data.reason,
      href: "/admin",
    });
    return { ok: true as const };
  });

export const blockUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (data.userId === user.id) return { ok: false as const, error: "You can't block yourself." };
    await db
      .insert(blocks)
      .values({ blockerId: user.id, blockedUserId: data.userId, createdAt: new Date().toISOString() })
      .onConflictDoNothing();
    return { ok: true as const };
  });

export const unblockUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    await db.delete(blocks).where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedUserId, data.userId)));
    return { ok: true as const };
  });
