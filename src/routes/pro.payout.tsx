import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/groom/AppShell";
import { ProTabs } from "@/components/groom/ProTabs";
import { PRO_EARNINGS } from "@/lib/mock";
import { ChevronLeft, Zap, Building2, Check } from "lucide-react";

export const Route = createFileRoute("/pro/payout")({
  head: () => ({ meta: [{ title: "Payout — GROOM Pro" }] }),
  component: Payout,
});

const HISTORY = [
  { d: "Jun 23", amt: 1820, status: "Paid", to: "•••• 4421" },
  { d: "Jun 16", amt: 1640, status: "Paid", to: "•••• 4421" },
  { d: "Jun 09", amt: 2010, status: "Paid", to: "•••• 4421" },
  { d: "Jun 02", amt: 1740, status: "Paid", to: "•••• 4421" },
];

function Payout() {
  return (
    <AppShell dark>
      <div className="bg-ink text-white min-h-full">
        <header className="px-5 pt-6 pb-3 flex items-center gap-3">
          <Link to="/pro/earnings"><ChevronLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-2xl">Payout</h1>
        </header>

        <div className="px-5 mt-2">
          <div className="rounded-3xl bg-gradient-to-br from-gold to-yellow-200 text-ink p-6">
            <div className="text-[10px] uppercase tracking-widest opacity-70">Available now</div>
            <div className="font-display text-5xl mt-1">${PRO_EARNINGS.payout.toLocaleString()}</div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="py-3 rounded-full bg-ink text-white text-sm font-medium inline-flex items-center justify-center gap-1"><Zap className="h-3.5 w-3.5 text-gold" />Instant payout</button>
              <button className="py-3 rounded-full bg-white/30 text-ink text-sm font-medium">Standard (1–2d)</button>
            </div>
            <div className="text-[10px] mt-3 opacity-70">Instant payouts arrive in seconds. 1% fee for Basic, free for Elite pros.</div>
          </div>
        </div>

        <section className="px-5 mt-6">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Bank account</div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gold" />
            <div className="flex-1">
              <div className="text-sm">Chase ····4421</div>
              <div className="text-[11px] text-white/50">Default · Verified</div>
            </div>
            <Check className="h-4 w-4 text-gold" />
          </div>
          <button className="mt-2 w-full py-3 rounded-2xl border border-dashed border-white/20 text-sm text-white/70">+ Add bank or debit card</button>
        </section>

        <section className="px-5 mt-6">
          <div className="text-[10px] uppercase tracking-widest text-white/50">History</div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10">
            {HISTORY.map((h,i)=>(
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm">${h.amt.toLocaleString()}</div>
                  <div className="text-[11px] text-white/50">{h.d} → {h.to}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold">{h.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ProTabs />
    </AppShell>
  );
}
