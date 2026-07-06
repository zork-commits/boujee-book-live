import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { useConversations, useThread, useSendMessage, usePro, fmtWhen } from "@/lib/api";
import { Send, ChevronLeft, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/messages")({
  head: () => ({ meta: [{ title: "Messages — Boujee Book" }] }),
  validateSearch: (s: Record<string, unknown>): { to?: string } => ({
    to: typeof s.to === "string" ? s.to : undefined, // proId to start a new chat with
  }),
  component: Messages,
});

function Messages() {
  const { to } = Route.useSearch();
  const { user } = Route.useRouteContext();
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newChatProId, setNewChatProId] = useState<string | null>(to ?? null);

  // If a chat with this pro already exists, open it instead of starting fresh.
  useEffect(() => {
    if (to && conversations) {
      const existing = conversations.find((c) => c.conversation.proId === to);
      if (existing) {
        setActiveId(existing.conversation.id);
        setNewChatProId(null);
      }
    }
  }, [to, conversations]);

  if (activeId || newChatProId) {
    return (
      <Thread
        conversationId={activeId}
        proId={newChatProId ?? conversations?.find((c) => c.conversation.id === activeId)?.conversation.proId ?? null}
        meId={user.id}
        onBack={() => { setActiveId(null); setNewChatProId(null); }}
        onCreated={(id) => { setNewChatProId(null); setActiveId(id); }}
      />
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2"><h1 className="font-display text-3xl">Messages</h1>
        <div className="text-xs text-muted-foreground mt-1">End-to-end with your pros.</div>
      </header>
      <div className="px-2 mt-4 divide-y divide-border">
        {isLoading && <div className="py-16 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {(conversations ?? []).map((t) => (
          <button key={t.conversation.id} onClick={() => setActiveId(t.conversation.id)} className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-cream/50">
            <img src={t.proAvatar} className="h-12 w-12 rounded-full object-cover" alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-sm truncate">{t.proName}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{fmtWhen(t.conversation.lastMessageAt)}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{t.lastMessage?.body ?? "Say hi"}</div>
            </div>
          </button>
        ))}
        {!isLoading && (conversations?.length ?? 0) === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No conversations yet — message a pro from their profile.</div>
        )}
      </div>
      <AppTabs />
    </AppShell>
  );
}

function Thread({ conversationId, proId, meId, onBack, onCreated }: {
  conversationId: string | null;
  proId: string | null;
  meId: string;
  onBack: () => void;
  onCreated: (conversationId: string) => void;
}) {
  const { data: messages } = useThread(conversationId);
  const { data: pro } = usePro(proId ?? "");
  const sendMessage = useSendMessage();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages?.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;
    setDraft("");
    const res = await sendMessage.mutateAsync(
      conversationId ? { body, conversationId } : { body, proId: proId! },
    );
    if (res.ok && !conversationId) onCreated(res.message.conversationId);
  };

  return (
    <AppShell>
      <header className="px-4 pt-5 pb-3 flex items-center gap-3 border-b border-border">
        <button onClick={onBack} aria-label="Back"><ChevronLeft className="h-5 w-5" /></button>
        {pro && <img src={pro.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{pro?.name ?? "…"}</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-gold" />Verified{pro ? ` · ${pro.craft}` : ""}</div>
        </div>
        <button
          onClick={() => toast("Calls unlock after a confirmed booking", { description: "Numbers stay private — message your pro here in the meantime." })}
          aria-label="Call"
          className="h-9 w-9 rounded-full border border-border grid place-items-center"
        >
          <Phone className="h-4 w-4" />
        </button>
      </header>
      <div ref={scrollRef} className="flex-1 px-4 py-4 space-y-3 min-h-[400px]">
        {(messages ?? []).map((m) => {
          const me = m.senderId === meId;
          return (
            <div key={m.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${me ? "bg-ink text-white rounded-br-sm" : "bg-cream text-ink rounded-bl-sm"}`}>
                {m.body}
                <div className={`text-[9px] mt-1 ${me ? "text-white/50" : "text-muted-foreground"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        {!conversationId && (messages?.length ?? 0) === 0 && (
          <div className="text-center text-xs text-muted-foreground pt-12">Start the conversation with {pro?.name ?? "your pro"}.</div>
        )}
      </div>
      <div className="sticky bottom-0 px-3 pb-3 pt-2 border-t border-border bg-background">
        <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Message…"
            className="bg-transparent flex-1 outline-none text-sm"
          />
          <button onClick={send} disabled={sendMessage.isPending} className="h-8 w-8 rounded-full bg-ink text-white grid place-items-center disabled:opacity-50">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
