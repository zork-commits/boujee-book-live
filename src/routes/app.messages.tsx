import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/groom/AppShell";
import { AppTabs } from "@/components/groom/AppTabs";
import { PROS } from "@/lib/mock";
import { Send, ChevronLeft, Phone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/app/messages")({
  head: () => ({ meta: [{ title: "Messages — GROOM" }] }),
  component: Messages,
});

const THREADS = PROS.slice(0, 5).map((p, i) => ({
  pro: p,
  last: [
    "See you at 4:30 — text when you're outside 💛",
    "I have a 2pm cancel if you'd like it.",
    "Brought the dusty rose color you asked about.",
    "Confirmed for Friday, soft glam.",
    "Lash fill done — looks gorgeous!",
  ][i],
  at: ["2m", "18m", "1h", "Yesterday", "2d"][i],
  unread: [2, 0, 1, 0, 0][i],
}));

const CONVO = [
  { me: false, t: "Hi! Looking forward to your appointment today.", at: "3:41 PM" },
  { me: true, t: "Same! Should I bring inspiration photos?", at: "3:42 PM" },
  { me: false, t: "Yes please, anything you love. I have your last formula on file.", at: "3:43 PM" },
  { me: true, t: "Perfect, see you soon 💛", at: "3:44 PM" },
  { me: false, t: "See you at 4:30 — text when you're outside.", at: "3:45 PM" },
];

function Messages() {
  const [active, setActive] = useState<string | null>(null);
  const thread = THREADS.find((t) => t.pro.id === active);

  if (thread) {
    return (
      <AppShell>
        <header className="px-4 pt-5 pb-3 flex items-center gap-3 border-b border-border">
          <button onClick={() => setActive(null)}><ChevronLeft className="h-5 w-5" /></button>
          <img src={thread.pro.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{thread.pro.name}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-gold" />Verified · {thread.pro.craft}</div>
          </div>
          <button className="h-9 w-9 rounded-full border border-border grid place-items-center"><Phone className="h-4 w-4" /></button>
        </header>
        <div className="flex-1 px-4 py-4 space-y-3">
          {CONVO.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${m.me ? "bg-ink text-white rounded-br-sm" : "bg-cream text-ink rounded-bl-sm"}`}>
                {m.t}
                <div className={`text-[9px] mt-1 ${m.me ? "text-white/50" : "text-muted-foreground"}`}>{m.at}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 pb-3 pt-2 border-t border-border bg-background">
          <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2">
            <input placeholder="Message…" className="bg-transparent flex-1 outline-none text-sm" />
            <button className="h-8 w-8 rounded-full bg-ink text-white grid place-items-center"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <AppTabs />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2"><h1 className="font-display text-3xl">Messages</h1>
        <div className="text-xs text-muted-foreground mt-1">End-to-end with your pros.</div>
      </header>
      <div className="px-2 mt-4 divide-y divide-border">
        {THREADS.map((t) => (
          <button key={t.pro.id} onClick={() => setActive(t.pro.id)} className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-cream/50">
            <img src={t.pro.avatar} className="h-12 w-12 rounded-full object-cover" alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-sm truncate">{t.pro.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{t.at}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{t.last}</div>
            </div>
            {t.unread > 0 && <span className="h-5 min-w-5 px-1.5 rounded-full bg-gold text-ink text-[10px] grid place-items-center font-medium">{t.unread}</span>}
          </button>
        ))}
      </div>
      <AppTabs />
    </AppShell>
  );
}
