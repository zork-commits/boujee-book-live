import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/groom/AppShell";
import { AppTabs } from "@/components/groom/AppTabs";
import { FAVORITES } from "@/lib/mock";
import { CreditCard, Bell, Heart, Gift, Settings, ChevronRight, Star, LogOut, MapPin, Shield, Crown, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/app/me")({
  component: Me,
});

function Me() {
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gold/40 to-gold/10 grid place-items-center font-display text-2xl">MR</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-2xl">Maya Rivera</div>
          <div className="text-xs text-muted-foreground">maya@groom.app</div>
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-[10px] uppercase tracking-widest"><Star className="h-2.5 w-2.5 fill-gold text-gold" />Elite Member</div>
        </div>
      </header>

      <div className="px-5 grid grid-cols-3 gap-2 text-center">
        {[["12","Bookings"],["$1,840","Spent"],["480","Points"]].map(([v,l])=>(
          <div key={l} className="rounded-2xl border border-border p-3">
            <div className="font-display text-lg">{v}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg mb-3">Favorites</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {FAVORITES.map(p=>(
            <Link key={p.id} to="/app/p/$id" params={{id:p.id}} className="shrink-0 flex flex-col items-center w-16">
              <img src={p.avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/50" />
              <div className="text-[10px] mt-1.5 truncate w-full text-center">{p.name.split(" ")[0]}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <Link to="/app/subscription" className="block rounded-3xl bg-ink text-white p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
          <div className="flex items-center gap-2 text-gold text-[10px] uppercase tracking-widest"><Crown className="h-3 w-3" />Elite Membership</div>
          <div className="font-display text-xl mt-2">Manage your plan</div>
          <div className="text-xs text-white/60 mt-1">Renews Jul 14 · $29.99/mo</div>
        </Link>
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-2xl border border-border divide-y divide-border">
          {[
            { i:CreditCard, l:"Payment methods", v:"•••• 4242" },
            { i:MapPin, l:"Saved addresses", v:"2 saved" },
            { i:Bell, l:"Notifications", v:"On" },
            { i:Heart, l:"Favorites", v:"4" },
            { i:Gift, l:"Rewards", v:"480 pts" },
            { i:ShieldCheck, l:"Trust & safety", v:"", to:"/app/safety" as const },
            { i:Shield, l:"Privacy & data", v:"" },
            { i:Settings, l:"Account settings", v:"" },
          ].map(r=>{const I=r.i;const inner=(<><I className="h-4 w-4 text-muted-foreground" /><span className="flex-1 text-sm">{r.l}</span>{r.v && <span className="text-[11px] text-muted-foreground">{r.v}</span>}<ChevronRight className="h-4 w-4 text-muted-foreground" /></>);return r.to ? (
            <Link key={r.l} to={r.to} className="w-full flex items-center gap-3 p-4 text-left">{inner}</Link>
          ) : (
            <button key={r.l} className="w-full flex items-center gap-3 p-4 text-left">{inner}</button>
          )})}
        </div>
      </section>

      <button className="mt-4 mx-5 mb-4 w-[calc(100%-2.5rem)] flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm text-destructive"><LogOut className="h-4 w-4" />Sign out</button>
      <AppTabs />
    </AppShell>
  );
}
