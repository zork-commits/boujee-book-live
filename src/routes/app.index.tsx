import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { CATEGORIES, TRENDING } from "@/lib/mock";
import { usePros, useMyBookings, useFavorites, fmtWhen, initials } from "@/lib/api";
import { Search, Bell, Star, MapPin, ChevronRight, Heart, Calendar, CreditCard, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Boujee Book — Find Your Next Professional" }] }),
  component: Home,
});

function Home() {
  const { user } = Route.useRouteContext();
  const { data: pros } = usePros();
  const { data: bookings } = useMyBookings();
  const { data: favorites } = useFavorites();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 grid place-items-center font-display text-base">{initials(user.name)}</div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{greeting}</div>
            <div className="font-display text-lg leading-tight">{user.name.split(" ")[0]}</div>
          </div>
        </div>
        <button className="h-10 w-10 grid place-items-center rounded-full border border-border relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>
      </header>

      <div className="px-5 mt-4">
        <h1 className="font-display text-3xl leading-tight">Find Your Next<br/>Professional.</h1>
        <Link to="/app/search" className="mt-4 flex items-center gap-3 rounded-2xl bg-cream border border-border px-4 py-3.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">Search pros, services, vibes…</span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-background border border-border">⌘K</span>
        </Link>
      </div>

      <div className="mt-5 flex gap-2 px-5 overflow-x-auto no-scrollbar">
        {["Near me","Open now","Elite","Mobile","Top rated","Under $80"].map((q,i)=>(
          <button key={q} className={`shrink-0 px-3.5 py-2 rounded-full text-xs border ${i===0?"bg-ink text-white border-ink":"border-border"}`}>{q}</button>
        ))}
      </div>

      <section className="mt-7 px-5">
        <SectionHead title="Categories" />
        <div className="mt-3 grid grid-cols-4 gap-3">
          {CATEGORIES.slice(0,8).map(c=>(
            <Link key={c.key} to="/app/search" search={{ cat: c.key }} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-cream border border-border">
              <span className="text-xl">{c.emoji}</span>
              <span className="text-[10px]">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {(bookings?.upcoming.length ?? 0) > 0 && (
        <section className="mt-7">
          <div className="px-5"><SectionHead title="Upcoming" link="/app/bookings" /></div>
          <div className="mt-3 flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
            {bookings!.upcoming.map(a=>(
              <Link key={a.booking.id} to="/app/tracking" className="shrink-0 w-[280px] rounded-2xl bg-ink text-white p-4">
                <div className="flex items-center gap-3">
                  <img src={a.proAvatar} alt={a.proName} className="h-11 w-11 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-base truncate">{a.proName}</div>
                    <div className="text-[11px] text-white/60 truncate">{a.booking.serviceName}</div>
                  </div>
                  <BadgeCheck className="h-4 w-4 text-gold" />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{a.booking.status}</div>
                    <div className="font-display text-lg">{fmtWhen(a.booking.scheduledAt)}</div>
                  </div>
                  <span className="text-[10px] text-gold">Track →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-7">
        <div className="px-5"><SectionHead title="Featured Professionals" link="/app/search" /></div>
        <div className="mt-3 flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
          {(pros ?? []).map(p=>(
            <Link key={p.id} to="/app/p/$id" params={{id:p.id}} className="shrink-0 w-[230px] rounded-2xl overflow-hidden bg-background border border-border">
              <div className="relative aspect-[4/5]">
                <img src={p.cover} alt={p.name} className="h-full w-full object-cover" />
                {p.elite && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold text-ink text-[9px] tracking-widest uppercase font-semibold">Elite</span>}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-display text-sm truncate">{p.name}</div>
                  <div className="flex items-center gap-0.5 text-[11px]"><Star className="h-3 w-3 fill-gold text-gold" />{p.rating}</div>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{p.craft}</div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.distance}mi</span>
                  <span>from ${p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="px-5"><SectionHead title="Trending Services" /></div>
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {TRENDING.map(t=>(
            <Link key={t.name} to="/app/search" className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={t.img} alt={t.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold text-ink text-[9px] tracking-widest uppercase font-semibold">{t.tag}</span>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="font-display text-sm">{t.name}</div>
                <div className="text-[10px] opacity-80">from ${t.from}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {(favorites?.length ?? 0) > 0 && (
        <section className="mt-7 px-5">
          <SectionHead title="Favorites" link="/app/me" />
          <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {favorites!.map(p=>(
              <Link key={p.id} to="/app/p/$id" params={{id:p.id}} className="shrink-0 flex flex-col items-center w-16">
                <img src={p.avatar} alt={p.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/50" />
                <div className="text-[10px] mt-1.5 truncate w-full text-center">{p.name.split(" ")[0]}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(bookings?.past.length ?? 0) > 0 && (
        <section className="mt-7 px-5">
          <SectionHead title="Recent Activity" />
          <div className="mt-3 rounded-2xl border border-border divide-y divide-border">
            {bookings!.past.slice(0,4).map(r=>{
              const Icon = r.booking.status === "completed" ? CreditCard : Calendar;
              return (
                <div key={r.booking.id} className="flex items-center gap-3 p-3">
                  <div className="h-8 w-8 rounded-full bg-cream grid place-items-center"><Icon className="h-3.5 w-3.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs"><span className="font-medium capitalize">{r.booking.status}</span> · {r.proName}</div>
                    <div className="text-[10px] text-muted-foreground truncate">${r.booking.price} · {r.booking.serviceName}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{fmtWhen(r.booking.scheduledAt)}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="h-4" />
      <AppTabs />
    </AppShell>
  );
}

function SectionHead({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="font-display text-xl">{title}</h2>
      {link && <Link to={link} className="text-[11px] text-muted-foreground inline-flex items-center">See all <ChevronRight className="h-3 w-3" /></Link>}
    </div>
  );
}
