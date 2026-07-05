import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/groom/AppShell";
import { ProTabs } from "@/components/groom/ProTabs";
import { PRO_CLIENTS } from "@/lib/mock";
import { Search, MessageSquare, Plus } from "lucide-react";

export const Route = createFileRoute("/pro/clients")({ component: Clients });

function Clients() {
  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 text-white flex items-center justify-between">
        <h1 className="font-display text-3xl">Clients</h1>
        <button className="h-10 w-10 grid place-items-center rounded-full bg-gold text-ink"><Plus className="h-4 w-4" /></button>
      </header>
      <div className="px-5 mt-2">
        <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2.5">
          <Search className="h-4 w-4 text-white/40" />
          <input placeholder="Search clients…" className="flex-1 bg-transparent text-sm text-white outline-none" />
        </div>
      </div>
      <div className="px-5 mt-5 space-y-2">
        {PRO_CLIENTS.map(c=>(
          <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold/50 to-gold/10 grid place-items-center font-display">{c.name.split(" ").map(n=>n[0]).join("")}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-display text-base">{c.name}</div>
                  <button className="h-7 w-7 rounded-full bg-white/10 grid place-items-center"><MessageSquare className="h-3.5 w-3.5" /></button>
                </div>
                <div className="text-[11px] text-white/50">{c.visits} visits · last {c.last}</div>
                <div className="mt-2 flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold">${c.spend} LTV</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10">{c.fav}</span>
                </div>
                <div className="mt-2 text-[11px] text-white/60 italic">"{c.note}"</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ProTabs />
    </AppShell>
  );
}
