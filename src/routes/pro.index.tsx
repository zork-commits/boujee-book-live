import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { Bars } from "@/components/boujee/Sparkline";
import { useProDashboard, useSetBookingStatus } from "@/lib/api";
import { Bell, ArrowUpRight, Loader2, Check } from "lucide-react";

export const Route = createFileRoute("/pro/")({ component: ProHome });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

function ProHome() {
  const { data, isLoading } = useProDashboard();
  const setStatus = useSetBookingStatus();

  if (isLoading || !data) {
    return (
      <AppShell dark>
        <div className="min-h-[600px] grid place-items-center text-white/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        <ProTabs />
      </AppShell>
    );
  }

  const { profile, today, earnings } = data;
  const confirmed = today.filter((a) => a.booking.status !== "pending" && a.booking.status !== "cancelled").length;
  const payout = Math.round(earnings.week * 0.7); // held balance until instant payout is wired to Stripe

  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <img src={profile?.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-gold/50" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">Pro Studio</div>
            <div className="font-display text-lg leading-tight">{profile?.name}</div>
          </div>
        </div>
        <button className="h-10 w-10 grid place-items-center rounded-full border border-white/20"><Bell className="h-4 w-4" /></button>
      </header>

      <div className="px-5 mt-3">
        <div className="rounded-3xl bg-gradient-to-br from-gold to-amber-300 p-5 text-ink">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Today</div>
          <div className="font-display text-5xl mt-1">${earnings.today.toLocaleString()}</div>
          <div className="text-xs mt-1">{confirmed} of {today.length} appointments confirmed</div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-xl bg-ink/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest opacity-60">Week</div>
              <div className="font-display text-lg">${earnings.week.toLocaleString()}</div>
            </div>
            <div className="flex-1 rounded-xl bg-ink/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest opacity-60">Month</div>
              <div className="font-display text-lg">${earnings.month.toLocaleString()}</div>
            </div>
          </div>
          <Link to="/pro/payout" className="mt-4 w-full bg-ink text-white rounded-full py-3 text-sm font-medium inline-flex items-center justify-center gap-2">Cash out ${payout.toLocaleString()} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>

      <section className="mt-7 px-5">
        <div className="flex items-end justify-between"><h2 className="font-display text-xl text-white">Today's Schedule</h2><Link to="/pro/schedule" className="text-[11px] text-white/60">See all</Link></div>
        <div className="mt-3 space-y-2">
          {today.length === 0 && <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white/50">No appointments today.</div>}
          {today.map((a)=>(
            <div key={a.booking.id} className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3 text-white">
              <div className="text-center w-12">
                <div className="font-display text-lg leading-none">{fmtTime(a.booking.scheduledAt)}</div>
                <div className="text-[10px] text-white/40">{a.booking.mins}m</div>
              </div>
              <div className="flex-1 min-w-0 border-l border-white/10 pl-3">
                <div className="text-sm font-medium truncate">{a.clientName}</div>
                <div className="text-[11px] text-white/50 truncate">{a.booking.serviceName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">${a.booking.price}</div>
                {a.booking.status === "pending" ? (
                  <button
                    onClick={()=>setStatus.mutate({ id: a.booking.id, status: "confirmed" })}
                    disabled={setStatus.isPending}
                    className="mt-0.5 text-[10px] text-gold inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" />Confirm
                  </button>
                ) : (
                  <div className="text-[10px] text-white/40 capitalize">{a.booking.status}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7 px-5">
        <h2 className="font-display text-xl text-white">This Week</h2>
        <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="text-gold"><Bars data={earnings.weekly} color="currentColor" height={80} /></div>
          <div className="mt-2 flex justify-between text-[10px] text-white/40">
            {Array.from({length:7}).map((_,i)=>{
              const d = new Date(); d.setDate(d.getDate() - (6 - i));
              return <span key={i}>{d.toLocaleDateString("en-US",{weekday:"narrow"})}</span>;
            })}
          </div>
        </div>
      </section>

      <section className="mt-7 px-5 pb-2">
        <h2 className="font-display text-xl text-white">Top Services</h2>
        <div className="mt-3 space-y-2">
          {earnings.topServices.map(s=>(
            <div key={s.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-white/50">{s.count} bookings</div>
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
