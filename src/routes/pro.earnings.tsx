import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/groom/AppShell";
import { ProTabs } from "@/components/groom/ProTabs";
import { Sparkline, Bars } from "@/components/groom/Sparkline";
import { PRO_EARNINGS } from "@/lib/mock";
import { ArrowUpRight, Download } from "lucide-react";

export const Route = createFileRoute("/pro/earnings")({ component: Earnings });

function Earnings() {
  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 text-white"><h1 className="font-display text-3xl">Earnings</h1></header>
      <div className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-gold to-amber-300 p-6 text-ink">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Available payout</div>
          <div className="font-display text-6xl mt-2">${PRO_EARNINGS.payout.toLocaleString()}</div>
          <div className="text-xs mt-1">Instant to •••• 4242 · no fee</div>
          <Link to="/pro/payout" className="mt-4 w-full bg-ink text-white rounded-full py-3 text-sm font-medium inline-flex items-center justify-center gap-2">Cash out now <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>

      <div className="px-5 mt-5 grid grid-cols-3 gap-2 text-white">
        {[["Today",PRO_EARNINGS.today],["Week",PRO_EARNINGS.week],["Month",PRO_EARNINGS.month]].map(([l,v])=>(
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
              <div className="font-display text-2xl">${PRO_EARNINGS.month.toLocaleString()}</div>
            </div>
            <span className="text-xs text-gold">+18.4%</span>
          </div>
          <div className="mt-4 text-gold"><Sparkline data={[400,520,460,610,580,720,640,810,760,890,920,1080]} /></div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-xl text-white mb-3">Revenue by service</h2>
        <div className="space-y-2">
          {PRO_EARNINGS.topServices.map(s=>(
            <div key={s.name} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
              <div className="flex items-center justify-between text-sm"><span>{s.name}</span><span className="text-gold">${s.revenue.toLocaleString()}</span></div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gold" style={{width:`${(s.revenue/4180)*100}%`}} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5 pb-2">
        <button className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 text-white text-sm"><Download className="h-4 w-4" />Export 1099 / Tax statement</button>
      </section>
      <ProTabs />
    </AppShell>
  );
}
