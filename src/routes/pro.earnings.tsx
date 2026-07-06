import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { Sparkline } from "@/components/boujee/Sparkline";
import { useProDashboard, useProBookings } from "@/lib/api";
import { ArrowUpRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/earnings")({ component: Earnings });

function Earnings() {
  const { data, isLoading } = useProDashboard();
  const { data: allBookings } = useProBookings();

  const exportCsv = () => {
    const completed = (allBookings ?? []).filter((b) => b.booking.status === "completed");
    if (completed.length === 0) {
      toast("Nothing to export yet", { description: "Completed bookings will appear in your statement." });
      return;
    }
    const rows = [
      ["date", "client", "service", "minutes", "amount_usd", "status"],
      ...completed.map((b) => [
        b.booking.scheduledAt.slice(0, 10),
        b.clientName,
        b.booking.serviceName,
        String(b.booking.mins),
        String(b.booking.price),
        b.booking.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "boujee-book-earnings.csv" });
    a.click();
    URL.revokeObjectURL(url);
    toast("Statement downloaded", { description: `${completed.length} completed bookings exported as CSV.` });
  };

  if (isLoading || !data) {
    return (
      <AppShell dark>
        <div className="min-h-[600px] grid place-items-center text-white/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        <ProTabs />
      </AppShell>
    );
  }

  const { earnings } = data;
  const payout = Math.round(earnings.week * 0.7);
  const maxRevenue = Math.max(...earnings.topServices.map((s) => s.revenue), 1);

  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 text-white"><h1 className="font-display text-3xl">Earnings</h1></header>
      <div className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-gold to-amber-300 p-6 text-ink">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Available payout</div>
          <div className="font-display text-6xl mt-2">${payout.toLocaleString()}</div>
          <div className="text-xs mt-1">Instant to •••• 4242 · no fee</div>
          <Link to="/pro/payout" className="mt-4 w-full bg-ink text-white rounded-full py-3 text-sm font-medium inline-flex items-center justify-center gap-2">Cash out now <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>

      <div className="px-5 mt-5 grid grid-cols-3 gap-2 text-white">
        {[["Today",earnings.today],["Week",earnings.week],["Month",earnings.month]].map(([l,v])=>(
          <div key={l as string} className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/40">{l}</div>
            <div className="font-display text-lg mt-1">${(v as number).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 px-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Last 30 days</div>
              <div className="font-display text-2xl">${earnings.month.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-4 text-gold"><Sparkline data={earnings.weekly.some((v)=>v>0) ? earnings.weekly : [0,0,0,0,0,0,0]} /></div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-xl text-white mb-3">Revenue by service</h2>
        <div className="space-y-2">
          {earnings.topServices.map(s=>(
            <div key={s.name} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
              <div className="flex items-center justify-between text-sm"><span>{s.name}</span><span className="text-gold">${s.revenue.toLocaleString()}</span></div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gold" style={{width:`${(s.revenue/maxRevenue)*100}%`}} /></div>
            </div>
          ))}
          {earnings.topServices.length === 0 && (
            <div className="text-center py-8 text-sm text-white/40">Complete your first booking to see revenue.</div>
          )}
        </div>
      </section>

      <section className="mt-6 px-5 pb-2">
        <button onClick={exportCsv} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 text-white text-sm"><Download className="h-4 w-4" />Export earnings statement (CSV)</button>
      </section>
      <ProTabs />
    </AppShell>
  );
}
