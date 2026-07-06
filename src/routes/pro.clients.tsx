import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { useProDashboard, fmtWhen, initials } from "@/lib/api";
import { Search, MessageSquare, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/clients")({ component: Clients });

function Clients() {
  const { data, isLoading } = useProDashboard();
  const [q, setQ] = useState("");
  const clients = (data?.clients ?? []).filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 text-white flex items-center justify-between">
        <h1 className="font-display text-3xl">Clients</h1>
        <button
          onClick={() => toast("Clients add themselves", { description: "Anyone who books you appears here automatically with their history." })}
          aria-label="About adding clients"
          className="h-10 w-10 grid place-items-center rounded-full bg-gold text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>
      <div className="px-5 mt-2">
        <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2.5">
          <Search className="h-4 w-4 text-white/40" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search clients…" className="flex-1 bg-transparent text-sm text-white outline-none" />
        </div>
      </div>
      <div className="px-5 mt-5 space-y-2">
        {isLoading && <div className="py-16 grid place-items-center text-white/50"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {clients.map(c=>(
          <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold/50 to-gold/10 grid place-items-center font-display">{initials(c.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-display text-base">{c.name}</div>
                  <Link to="/app/messages" aria-label={`Message ${c.name}`} className="h-7 w-7 rounded-full bg-white/10 grid place-items-center"><MessageSquare className="h-3.5 w-3.5" /></Link>
                </div>
                <div className="text-[11px] text-white/50">{c.visits} visits · last {fmtWhen(c.last)}</div>
                <div className="mt-2 flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold">${c.spend.toLocaleString()} LTV</span>
                  {c.fav && <span className="px-2 py-0.5 rounded-full bg-white/10">{c.fav}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && clients.length === 0 && (
          <div className="text-center py-12 text-sm text-white/40">No clients yet.</div>
        )}
      </div>
      <ProTabs />
    </AppShell>
  );
}
