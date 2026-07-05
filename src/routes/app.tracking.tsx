import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { UPCOMING } from "@/lib/mock";
import { ChevronLeft, Phone, MessageSquare, Shield } from "lucide-react";

export const Route = createFileRoute("/app/tracking")({
  component: Tracking,
});

function Tracking() {
  const a = UPCOMING[0];
  return (
    <AppShell>
      <div className="relative h-[55vh] lg:h-[420px] bg-cream overflow-hidden">
        <img src="https://api.maptiler.com/maps/streets-v2/static/-73.99,40.71,12,0/600x800.png?key=demo" alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" onError={(e)=>{(e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"}} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        <div className="absolute top-4 left-4">
          <Link to="/app/bookings" className="h-9 w-9 rounded-full bg-background grid place-items-center shadow-luxury"><ChevronLeft className="h-4 w-4" /></Link>
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gold text-ink text-[10px] tracking-widest uppercase font-semibold">Elite Tracking</div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gold/30 animate-ping absolute inset-0" />
            <div className="h-16 w-16 rounded-full bg-gold border-4 border-background grid place-items-center"><span className="text-xl">💈</span></div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative">
        <div className="rounded-3xl bg-background border border-border shadow-luxury p-5">
          <div className="text-[10px] uppercase tracking-widest text-gold">En route</div>
          <div className="font-display text-3xl mt-1">Arriving in 7 min</div>
          <div className="text-xs text-muted-foreground mt-1">{a.pro.name} · {a.service}</div>

          <div className="mt-5 space-y-3">
            {[
              { l:"Booking confirmed", t:"3:48 PM", done:true },
              { l:"Pro accepted", t:"3:50 PM", done:true },
              { l:"En route", t:"4:18 PM", done:true, active:true },
              { l:"Arrived", t:"—", done:false },
            ].map((s,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${s.done?"bg-gold":"bg-border"} ${s.active?"ring-4 ring-gold/30":""}`} />
                <div className="flex-1 text-sm">{s.l}</div>
                <div className="text-[11px] text-muted-foreground">{s.t}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 pt-5 border-t border-border">
            <img src={a.pro.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="font-display text-base">{a.pro.name}</div>
              <div className="text-[11px] text-muted-foreground">License #BARB-44912</div>
            </div>
            <button className="h-10 w-10 rounded-full bg-cream grid place-items-center"><MessageSquare className="h-4 w-4" /></button>
            <button className="h-10 w-10 rounded-full bg-ink text-white grid place-items-center"><Phone className="h-4 w-4" /></button>
          </div>

          <div className="mt-4 text-[11px] text-muted-foreground inline-flex items-center gap-1"><Shield className="h-3 w-3" />Boujee Book Safety: pin shared at arrival</div>
        </div>
      </div>
    </AppShell>
  );
}
