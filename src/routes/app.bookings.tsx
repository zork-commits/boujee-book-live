import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { UPCOMING, PAST } from "@/lib/mock";
import { MapPin, MessageSquare, Star } from "lucide-react";

export const Route = createFileRoute("/app/bookings")({
  component: Bookings,
});

function Bookings() {
  const [tab, setTab] = useState<"up"|"past">("up");
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3"><h1 className="font-display text-3xl">Bookings</h1></header>
      <div className="px-5 mt-2 grid grid-cols-2 gap-1 p-1 rounded-full bg-cream border border-border">
        <button onClick={()=>setTab("up")} className={`py-2 rounded-full text-xs ${tab==="up"?"bg-ink text-white":""}`}>Upcoming</button>
        <button onClick={()=>setTab("past")} className={`py-2 rounded-full text-xs ${tab==="past"?"bg-ink text-white":""}`}>Past</button>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {tab==="up" && UPCOMING.map(a=>(
          <div key={a.id} className="rounded-2xl border border-border overflow-hidden">
            <div className="p-4 flex gap-3">
              <img src={a.pro.avatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-base truncate">{a.pro.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{a.service} · {a.mins}min</div>
                <div className="text-xs mt-1">{a.when}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-ink h-fit">{a.status}</span>
            </div>
            <div className="border-t border-border grid grid-cols-3 text-xs">
              <Link to="/app/tracking" className="py-3 text-center inline-flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />Track</Link>
              <button className="py-3 border-x border-border inline-flex items-center justify-center gap-1"><MessageSquare className="h-3 w-3" />Message</button>
              <button className="py-3 text-destructive">Cancel</button>
            </div>
          </div>
        ))}
        {tab==="past" && PAST.map(p=>(
          <div key={p.id} className="p-4 rounded-2xl border border-border flex gap-3">
            <img src={p.pro.avatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-display text-base truncate">{p.pro.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{p.service}</div>
              <div className="text-xs mt-1 flex items-center gap-3">
                <span>{p.when}</span>
                <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-gold text-gold" />{p.rated}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">${p.paid}</div>
              <button className="text-[10px] mt-1 px-2 py-1 rounded-full border border-border">Rebook</button>
            </div>
          </div>
        ))}
      </div>
      <AppTabs />
    </AppShell>
  );
}
