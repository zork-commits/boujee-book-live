import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { Bars } from "@/components/boujee/Sparkline";
import { PRO_ME, PRO_TODAY, PRO_EARNINGS } from "@/lib/mock";
import { Bell, ArrowUpRight, Clock } from "lucide-react";

export const Route = createFileRoute("/pro/")({ component: ProHome });

function ProHome() {
  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <img src={PRO_ME.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-gold/50" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">Pro Studio</div>
            <div className="font-display text-lg leading-tight">{PRO_ME.name}</div>
          </div>
        </div>
        <button className="h-10 w-10 grid place-items-center rounded-full border border-white/20"><Bell className="h-4 w-4" /></button>
      </header>

      <div className="px-5 mt-3">
        <div className="rounded-3xl bg-gradient-to-br from-gold to-amber-300 p-5 text-ink">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Today</div>
          <div className="font-display text-5xl mt-1">${PRO_EARNINGS.today}</div>
          <div className="text-xs mt-1">5 of 6 appointments confirmed</div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-xl bg-ink/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest opacity-60">Week</div>
              <div className="font-display text-lg">${PRO_EARNINGS.week.toLocaleString()}</div>
            </div>
            <div className="flex-1 rounded-xl bg-ink/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest opacity-60">Month</div>
              <div className="font-display text-lg">${PRO_EARNINGS.month.toLocaleString()}</div>
            </div>
          </div>
          <Link to="/pro/payout" className="mt-4 w-full bg-ink text-white rounded-full py-3 text-sm font-medium inline-flex items-center justify-center gap-2">Cash out ${PRO_EARNINGS.payout} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>

      <section className="mt-7 px-5">
        <div className="flex items-end justify-between"><h2 className="font-display text-xl text-white">Today's Schedule</h2><Link to="/pro/schedule" className="text-[11px] text-white/60">See all</Link></div>
        <div className="mt-3 space-y-2">
          {PRO_TODAY.map(a=>(
            <div key={a.id} className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3 text-white">
              <div className="text-center w-12">
                <div className="font-display text-lg leading-none">{a.time}</div>
                <div className="text-[10px] text-white/40">{a.mins}m</div>
              </div>
              <div className="flex-1 min-w-0 border-l border-white/10 pl-3">
                <div className="text-sm font-medium truncate">{a.client}</div>
                <div className="text-[11px] text-white/50 truncate">{a.service}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">${a.price}</div>
                <div className={`text-[10px] ${a.status==="Pending"?"text-gold":"text-white/40"}`}>{a.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7 px-5">
        <h2 className="font-display text-xl text-white">This Week</h2>
        <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="text-gold"><Bars data={PRO_EARNINGS.weekly} color="currentColor" height={80} /></div>
          <div className="mt-2 flex justify-between text-[10px] text-white/40">
            {["M","T","W","T","F","S","S"].map(d=>(<span key={d}>{d}</span>))}
          </div>
        </div>
      </section>

      <section className="mt-7 px-5 pb-2">
        <h2 className="font-display text-xl text-white">Top Services</h2>
        <div className="mt-3 space-y-2">
          {PRO_EARNINGS.topServices.map(s=>(
            <div key={s.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-white/50">{s.bookings} bookings</div>
              </div>
              <div className="font-display text-lg text-gold">${s.revenue.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
      <ProTabs />
    </AppShell>
  );
}
