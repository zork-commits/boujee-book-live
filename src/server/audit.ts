import { nanoid } from "nanoid";
import { db } from "@/db";
import { auditLog } from "@/db/schema";

/** Record a privileged action. Never throws — auditing must not break the action itself. */
export async function audit(
  actorId: string,
  action: string,
  target?: { type: string; id: string },
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: nanoid(),
      actorId,
      action,
      targetType: target?.type ?? null,
      targetId: target?.id ?? null,
      meta: meta ?? null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("audit log write failed", err);
  }
}
