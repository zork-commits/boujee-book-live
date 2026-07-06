import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { CATEGORIES } from "@/lib/mock";
import { CategoryIcon } from "@/components/boujee/CategoryIcon";
import { usePros } from "@/lib/api";
import { Search, SlidersHorizontal, Star, MapPin, ChevronLeft, Loader2 } from "lucide-react";

export type SearchFilter = "elite" | "mobile" | "under80";
export type SearchSort = "rating" | "price" | "distance";

export const Route = createFileRoute("/app/search")({
  validateSearch: (s: Record<string, unknown>): { cat?: string; f?: SearchFilter; sort?: SearchSort } => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    f: s.f === "elite" || s.f === "mobile" || s.f === "under80" ? s.f : undefined,
    sort: s.sort === "rating" || s.sort === "price" || s.sort === "distance" ? s.sort : undefined,
  }),
  component: Discover,
});

const FILTERS: { key: SearchFilter; label: string }[] = [
  { key: "elite", label: "Elite" },
  { key: "mobile", label: "Mobile" },
  { key: "under80", label: "Under $80" },
];
const SORTS: { key: SearchSort; label: string }[] = [
  { key: "rating", label: "Top rated" },
  { key: "price", label: "Price" },
  { key: "distance", label: "Nearest" },
];

function Discover() {
  const { cat: initialCat, f: initialFilter, sort: initialSort } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(initialCat ?? null);
  const [filter, setFilter] = useState<SearchFilter | null>(initialFilter ?? null);
  const [sort, setSort] = useState<SearchSort>(initialSort ?? "rating");
  const [panelOpen, setPanelOpen] = useState(!!initialFilter || !!initialSort);
  const { data: pros, isLoading } = usePros({ q: q || undefined, category: cat ?? undefined, sort });

  const filtered = (pros ?? []).filter((p) =>
    filter === "elite" ? p.elite : filter === "mobile" ? p.mobile : filter === "under80" ? p.price < 80 : true,
  );

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/app" className="h-9 w-9 grid place-items-center rounded-full border border-border"><ChevronLeft className="h-4 w-4" /></Link>
        <div className="flex-1 flex items-center gap-2 rounded-full bg-cream border border-border px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search pros, services…" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <button
          onClick={() => setPanelOpen((o) => !o)}
          aria-label="Filters and sorting"
          aria-expanded={panelOpen}
          className={`h-9 w-9 grid place-items-center rounded-full border ${panelOpen || filter ? "bg-ink text-white border-ink" : "border-border"}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </header>

      <div className="mt-2 flex gap-2 px-5 overflow-x-auto no-scrollbar">
        <button onClick={()=>setCat(null)} className={`shrink-0 px-3.5 py-2 rounded-full text-xs border ${cat===null?"bg-ink text-white border-ink":"border-border"}`}>All</button>
        {CATEGORIES.map(c=>(
          <button key={c.key} onClick={()=>setCat(c.key)} className={`shrink-0 px-3.5 py-2 rounded-full text-xs border inline-flex items-center gap-1.5 ${cat===c.key?"bg-ink text-white border-ink":"border-border"}`}>
            <CategoryIcon category={c.key} className="h-3.5 w-3.5" />{c.label}
          </button>
        ))}
      </div>

      {panelOpen && (
        <div className="mt-3 px-5 py-3 mx-5 rounded-2xl bg-cream border border-border space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-10">Sort</span>
            {SORTS.map((s) => (
              <button key={s.key} onClick={() => setSort(s.key)} className={`px-3 py-1.5 rounded-full text-xs border ${sort===s.key?"bg-ink text-white border-ink":"border-border bg-background"}`}>{s.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-10">Show</span>
            {FILTERS.map((fl) => (
              <button key={fl.key} onClick={() => setFilter(filter === fl.key ? null : fl.key)} className={`px-3 py-1.5 rounded-full text-xs border ${filter===fl.key?"bg-gold text-ink border-gold":"border-border bg-background"}`}>{fl.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 mt-6 text-xs text-muted-foreground">
        {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Searching…</span> : `${filtered.length} pros nearby`}
      </div>

      <div className="px-5 mt-3 space-y-3 pb-4">
        {filtered.map(p=>(
          <Link key={p.id} to="/app/p/$id" params={{id:p.id}} className="flex gap-3 p-3 rounded-2xl border border-border bg-background">
            <img src={p.cover} alt={p.name} className="h-24 w-24 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-base truncate">{p.name}</div>
                <div className="flex items-center gap-0.5 text-[11px]"><Star className="h-3 w-3 fill-gold text-gold" />{p.rating}<span className="text-muted-foreground"> ({p.reviewCount})</span></div>
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
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No pros match that search yet.</div>
        )}
      </div>
      <AppTabs />
    </AppShell>
  );
}
