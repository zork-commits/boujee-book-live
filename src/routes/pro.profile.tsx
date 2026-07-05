import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { PRO_ME } from "@/lib/mock";
import { Plus, Camera, Star, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/pro/profile")({ component: Studio });

function Studio() {
  return (
    <AppShell dark>
      <div className="relative">
        <img src={PRO_ME.cover} alt="" className="aspect-[16/9] w-full object-cover opacity-60" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent h-32" />
        <button className="absolute bottom-3 right-3 h-9 px-3 rounded-full bg-ink/80 text-white text-xs inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />Edit cover</button>
      </div>
      <div className="px-5 -mt-12 relative text-white">
        <img src={PRO_ME.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-ink" />
        <div className="mt-3 font-display text-2xl">{PRO_ME.name}</div>
        <div className="text-xs text-white/60">{PRO_ME.craft} · {PRO_ME.city}</div>
        <div className="mt-2 text-xs inline-flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" />{PRO_ME.rating} ({PRO_ME.reviews})</div>
      </div>

      <section className="mt-6 px-5 text-white">
        <h2 className="font-display text-xl mb-3">Services & pricing</h2>
        <div className="space-y-2">
          {PRO_ME.services.map(s=>(
            <div key={s.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-white/50">{s.mins}min · ${s.price}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/40" />
            </div>
          ))}
          <button className="w-full py-3 rounded-2xl border border-dashed border-white/20 text-white/70 text-sm inline-flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" />Add service</button>
        </div>
      </section>

      <section className="mt-6 px-5 text-white">
        <h2 className="font-display text-xl mb-3">Portfolio</h2>
        <div className="grid grid-cols-3 gap-1.5">
          {PRO_ME.portfolio.map((src,i)=>(
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5"><img src={src} alt="" className="h-full w-full object-cover" /></div>
          ))}
          <button className="aspect-square rounded-xl border border-dashed border-white/20 grid place-items-center"><Plus className="h-5 w-5 text-white/60" /></button>
        </div>
      </section>

      <section className="mt-6 px-5 pb-2 text-white">
        <h2 className="font-display text-xl mb-3">Availability</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5">
          {["Mon · 9am–7pm","Tue · 9am–7pm","Wed · 9am–7pm","Thu · 10am–8pm","Fri · 10am–8pm","Sat · 10am–6pm","Sun · Closed"].map(d=>(
            <div key={d} className="flex items-center justify-between p-3 text-sm"><span>{d}</span><ChevronRight className="h-4 w-4 text-white/40" /></div>
          ))}
        </div>
      </section>
      <ProTabs />
    </AppShell>
  );
}
