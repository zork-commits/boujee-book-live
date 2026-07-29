import { eq, and, or } from "drizzle-orm";
import { db } from "@/db";
import { blocks } from "@/db/schema";

export async function isBlockedEitherWay(a: string, b: string): Promise<boolean> {
  const rows = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, a), eq(blocks.blockedUserId, b)),
        and(eq(blocks.blockerId, b), eq(blocks.blockedUserId, a)),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
