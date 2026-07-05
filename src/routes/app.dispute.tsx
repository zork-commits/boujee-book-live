import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { PAST } from "@/lib/mock";

export const Route = createFileRoute("/app/dispute")({
  head: () => ({ meta: [{ title: "Dispute Center — Boujee Book" }] }),
  component: Dispute,
});

const REASONS = ["Service quality", "Pro no-show", "Late arrival", "Sanitation concern", "Billing issue", "Safety / conduct", "Other"];

function Dispute() {
  const [booking, setBooking] = useState(PAST[0].id);
  const [reason, setReason] = useState(REASONS[0]);
  const [sent, setSent] = useState(false);

  if (sent) return (
    <AppShell>
      <div className="px-5 pt-20 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gold/20 grid place-items-center"><ShieldCheck className="h-8 w-8 text-gold" /></div>
        <h2 className="font-display text-2xl mt-5">Report received</h2>
        <p className="text-sm text-muted-foreground mt-2">Our trust team responds within 4 hours. We'll message you in-app.</p>
        <Link to="/app" className="inline-block mt-8 px-6 py-3 rounded-full bg-ink text-white text-sm">Back to home</Link>
      </div>
      <AppTabs />
    </AppShell>
  );

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/app/safety"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-2xl">Dispute center</h1>
      </header>
      <div className="px-5 mt-2 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Booking</label>
          <select value={booking} onChange={e=>setBooking(e.target.value)} className="mt-1 w-full px-3 py-3 rounded-xl bg-cream text-sm outline-none">
            {PAST.map(p => <option key={p.id} value={p.id}>{p.pro.name} · {p.service} · {p.when}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Reason</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {REASONS.map(r => (
              <button key={r} onClick={()=>setReason(r)} className={`px-3 py-1.5 rounded-full text-xs border ${reason===r?"bg-ink text-white border-ink":"border-border"}`}>{r}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Tell us what happened</label>
          <textarea rows={5} placeholder="Describe the issue. Add any details that help our team review faster." className="mt-1 w-full px-3 py-3 rounded-xl bg-cream text-sm outline-none resize-none" />
        </div>
        <button className="w-full py-3 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">+ Attach photo evidence</button>
        <button onClick={()=>setSent(true)} className="w-full py-4 rounded-full bg-ink text-white font-medium">Submit report</button>
      </div>
      <AppTabs />
    </AppShell>
  );
}
