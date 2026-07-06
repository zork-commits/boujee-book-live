import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc, asc, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, ensureDb } from "@/db";
import { conversations, messages, pros } from "@/db/schema";
import { requireUser, type SessionUser } from "@/server/session";

async function assertParticipant(conversationId: string, user: SessionUser) {
  const [convo] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!convo) throw new Response("Conversation not found", { status: 404 });
  const isCustomer = convo.customerId === user.id;
  const isPro = user.proId != null && convo.proId === user.proId;
  if (!isCustomer && !isPro) throw new Response("Forbidden", { status: 403 });
  return convo;
}

export const myConversations = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const rows = await db
    .select({
      conversation: conversations,
      proName: pros.name,
      proCraft: pros.craft,
      proAvatar: pros.avatar,
    })
    .from(conversations)
    .innerJoin(pros, eq(conversations.proId, pros.id))
    .where(
      user.proId
        ? or(eq(conversations.customerId, user.id), eq(conversations.proId, user.proId))
        : eq(conversations.customerId, user.id),
    )
    .orderBy(desc(conversations.lastMessageAt));

  return Promise.all(
    rows.map(async (row) => {
      const [last] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, row.conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      return { ...row, lastMessage: last ?? null };
    }),
  );
});

export const getMessages = createServerFn({ method: "GET" })
  .inputValidator(z.object({ conversationId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    await assertParticipant(data.conversationId, user);
    return db.select().from(messages).where(eq(messages.conversationId, data.conversationId)).orderBy(asc(messages.createdAt));
  });

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      body: z.string().trim().min(1).max(4000),
      conversationId: z.string().optional(),
      proId: z.string().optional(), // used to start a new conversation with a pro
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    await ensureDb();
    const now = new Date().toISOString();

    let conversationId = data.conversationId;
    if (conversationId) {
      await assertParticipant(conversationId, user);
    } else {
      if (!data.proId) return { ok: false as const, error: "proId or conversationId required." };
      const [existing] = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.customerId, user.id), eq(conversations.proId, data.proId)))
        .limit(1);
      if (existing) {
        conversationId = existing.id;
      } else {
        conversationId = nanoid();
        await db.insert(conversations).values({ id: conversationId, customerId: user.id, proId: data.proId, lastMessageAt: now });
      }
    }

    const message = { id: nanoid(), conversationId, senderId: user.id, body: data.body, createdAt: now };
    await db.insert(messages).values(message);
    await db.update(conversations).set({ lastMessageAt: now }).where(eq(conversations.id, conversationId));
    return { ok: true as const, message };
  });
