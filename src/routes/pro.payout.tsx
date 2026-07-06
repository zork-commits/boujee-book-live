import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { useProDashboard } from "@/lib/api";
import { ChevronLeft, Zap, Building2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const bankToast = () =>
  toast("Bank linking arrives with Stripe Connect", { description: "Your balance keeps accruing — payouts activate at launch." });

export const Route = createFileRoute("/pro/payout")({
  head: () => ({ meta: [{ title: "Payout — Boujee Book Pro" }] }),
  component: Payout,
});

function Payout() {
  const { data, isLoading } = useProDashboard();
  // Held balance until Stripe Connect payouts are wired — mirrors the dashboard figure.
  const available = data ? Math.round(data.earnings.week * 0.7) : 0;
  const weekly = data?.earnings.weekly ?? [];
  const history = weekly
    .map((amt, i) => ({ amt, daysAgo: weekly.length - 1 - i }))
    .filter((h) => h.amt > 0)
    .slice(0, 4)
    .map((h) => {
      const d = new Date();
      d.setDate(d.getDate() - h.daysAgo);
      return { d: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), amt: h.amt };
    });

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
            <div className="font-display text-5xl mt-1">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : `$${available.toLocaleString()}`}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={bankToast} className="py-3 rounded-full bg-ink text-white text-sm font-medium inline-flex items-center justify-center gap-1"><Zap className="h-3.5 w-3.5 text-gold" />Instant payout</button>
              <button onClick={bankToast} className="py-3 rounded-full bg-white/30 text-ink text-sm font-medium">Standard (1–2d)</button>
            </div>
            <div className="text-[10px] mt-3 opacity-70">Instant payouts arrive in seconds. 1% fee for Basic, free for Elite pros.</div>
          </div>
        </div>

        <section className="px-5 mt-6">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Bank account</div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gold" />
            <div className="flex-1">
              <div className="text-sm">Connect a bank account</div>
              <div className="text-[11px] text-white/50">Payouts activate once your bank is linked</div>
            </div>
            <Check className="h-4 w-4 text-white/30" />
          </div>
          <button onClick={bankToast} className="mt-2 w-full py-3 rounded-2xl border border-dashed border-white/20 text-sm text-white/70">+ Add bank or debit card</button>
        </section>

        <section className="px-5 mt-6 pb-4">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Recent earnings</div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10">
            {history.map((h,i)=>(
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm">${h.amt.toLocaleString()}</div>
                  <div className="text-[11px] text-white/50">{h.d}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold">Earned</span>
              </div>
            ))}
            {!isLoading && history.length === 0 && (
              <div className="p-4 text-sm text-white/40">Earnings will appear here after your first completed booking.</div>
            )}
          </div>
        </section>
      </div>
      <ProTabs />
    </AppShell>
  );
}
