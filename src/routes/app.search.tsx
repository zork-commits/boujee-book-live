import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/groom/AppShell";
import { AppTabs } from "@/components/groom/AppTabs";
import { PROS, CATEGORIES } from "@/lib/mock";
import { Search, SlidersHorizontal, Star, MapPin, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/app/search")({
  component: Discover,
});

function Discover() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const filtered = PROS.filter(p => (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.craft.toLowerCase().includes(q.toLowerCase())) && (!cat || p.craft.toLowerCase().includes(cat)));
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/app" className="h-9 w-9 grid place-items-center rounded-full border border-border"><ChevronLeft className="h-4 w-4" /></Link>
        <div className="flex-1 flex items-center gap-2 rounded-full bg-cream border border-border px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search pros, services…" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <button className="h-9 w-9 grid place-items-center rounded-full border border-border"><SlidersHorizontal className="h-4 w-4" /></button>
      </header>

      <div className="mt-2 flex gap-2 px-5 overflow-x-auto no-scrollbar">
        <button onClick={()=>setCat(null)} className={`shrink-0 px-3.5 py-2 rounded-full text-xs border ${cat===null?"bg-ink text-white border-ink":"border-border"}`}>All</button>
        {CATEGORIES.map(c=>(
          <button key={c.key} onClick={()=>setCat(c.key)} className={`shrink-0 px-3.5 py-2 rounded-full text-xs border inline-flex items-center gap-1.5 ${cat===c.key?"bg-ink text-white border-ink":"border-border"}`}>
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      <div className="px-5 mt-6 text-xs text-muted-foreground">{filtered.length} pros nearby</div>

      <div className="px-5 mt-3 space-y-3 pb-4">
        {filtered.map(p=>(
          <Link key={p.id} to="/app/p/$id" params={{id:p.id}} className="flex gap-3 p-3 rounded-2xl border border-border bg-background">
            <img src={p.cover} alt={p.name} className="h-24 w-24 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-base truncate">{p.name}</div>
                <div className="flex items-center gap-0.5 text-[11px]"><Star className="h-3 w-3 fill-gold text-gold" />{p.rating}<span className="text-muted-foreground"> ({p.reviews})</span></div>
              </div>
              <div className="text-[11px] text-muted-foreground">{p.craft}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.tags.slice(0,3).map(t=>(<span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cream">{t}</span>))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.distance}mi · {p.city}</span>
                <span className="font-medium">${p.price}+</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <AppTabs />
    </AppShell>
  );
}
