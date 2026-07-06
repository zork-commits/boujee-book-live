import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkline, Bars } from "@/components/boujee/Sparkline";
import { INVESTOR, ADMIN_KPI } from "@/lib/mock";
import { Lock, Download, ArrowUpRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/investors")({
  head: () => ({ meta: [{ title: "Investors — Boujee Book" }, { name: "robots", content: "noindex" }] }),
  component: Investors,
});

function Investors() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-white/10 px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-[0.25em] text-gold">BOUJEE BOOK<sup className="text-[9px] tracking-normal opacity-60">™</sup></Link>
        <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40"><Lock className="h-3 w-3" />Confidential · For investors only</div>
        <a href="mailto:ir@boujeebook.app?subject=Deck%20request" className="text-xs px-4 py-2 rounded-full border border-white/20 inline-flex items-center gap-1.5"><Download className="h-3 w-3" />Deck</a>
      </header>

      <section className="px-6 lg:px-12 pt-12 pb-8">
        <div className="text-[10px] tracking-[0.4em] text-gold uppercase mb-4">Series A · Confidential</div>
        <h1 className="font-display text-5xl lg:text-7xl">Building the OS for a <em className="text-gold not-italic">$480B</em> industry.</h1>
        <p className="mt-4 text-white/60 max-w-2xl">Boujee Book is the booking, payments, and CRM layer for the global personal care economy.</p>
      </section>

      <section className="px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["ARR","$22.1M","+184% YoY"],
          ["MRR","$1.84M","+18.4% MoM"],
          ["GMV (TTM)","$71.2M","+212% YoY"],
          ["Gross margin","71%","SaaS-like"],
          ["LTV / CAC","10.8×","top decile"],
          ["Net churn","-2.1%","negative"],
          ["Cities","142","+38 this Q"],
          ["Pros","6,240","85% activation"],
        ].map(([l,v,d])=>(
          <div key={l as string} className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-widest text-white/40">{l}</div>
            <div className="font-display text-3xl mt-1">{v}</div>
            <div className="text-[11px] text-gold mt-1">{d}</div>
          </div>
        ))}
      </section>

      <section className="px-6 lg:px-12 mt-8 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">MRR (12 months)</div>
              <div className="font-display text-3xl mt-1">$1,840,000</div>
            </div>
            <span className="text-xs text-gold inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />+18.4% MoM</span>
          </div>
          <div className="mt-6 text-gold"><Sparkline data={INVESTOR.mrrSeries} height={160} /></div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40">Revenue mix</div>
          <div className="mt-4 space-y-3">
            {INVESTOR.rev.map(r=>(
              <div key={r.name}>
                <div className="flex justify-between text-sm"><span>{r.name}</span><span className="text-gold">{r.v}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gold" style={{width:`${r.v}%`}} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 mt-4 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40">GMV by month ($M)</div>
          <div className="mt-4 text-gold"><Bars data={INVESTOR.gmvSeries} color="currentColor" height={140} /></div>
          <div className="mt-2 flex justify-between text-[10px] text-white/40">{["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>(<span key={i}>{m}</span>))}</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40">Market</div>
          <div className="font-display text-4xl mt-2">$480B</div>
          <div className="text-xs text-white/60 mt-1">Global personal care services TAM</div>
          <div className="mt-5 space-y-2 text-sm">
            <Row k="SAM (US + EU)" v="$182B" />
            <Row k="SOM (5-yr)" v="$8.4B" />
            <Row k="Penetration" v="0.06%" />
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 mt-4 grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40">Cap stack</div>
          <table className="mt-3 w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/40"><tr><th className="text-left py-2">Round</th><th className="text-left py-2">Date</th><th className="text-right py-2">Raised</th><th className="text-right py-2">Valuation</th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {INVESTOR.rounds.map(r=>(
                <tr key={r.name}><td className="py-3 font-display">{r.name}</td><td className="py-3 text-white/60">{r.date}</td><td className="py-3 text-right">${r.amount}M</td><td className="py-3 text-right text-gold">${r.valuation}M</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40">Unit economics</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Stat k="LTV" v="$412" />
            <Stat k="CAC" v="$38" />
            <Stat k="Payback" v="2.1 mo" />
            <Stat k="Contribution margin" v="62%" />
            <Stat k="Gross margin" v="71%" />
            <Stat k="Burn multiple" v="0.42×" />
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 mt-4 mb-16">
        <div className="rounded-3xl bg-gradient-to-br from-gold to-amber-300 text-ink p-8 lg:p-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">Currently raising</div>
            <div className="font-display text-5xl lg:text-6xl mt-2">$40M Series B</div>
            <div className="mt-2 text-sm">Led by undisclosed · 18-month runway extension to $80M ARR</div>
          </div>
          <a href="mailto:ir@boujeebook.app" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-white text-sm font-medium">Request data room <ArrowUpRight className="h-4 w-4" /></a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 lg:px-12 py-6 text-[11px] text-white/40 flex justify-between">
        <span>© 2026 Boujee Book Technologies, Inc.</span>
        <span>All figures are demonstration data.</span>
      </footer>
    </div>
  );
}

function Row({k,v}:{k:string;v:string}) { return <div className="flex justify-between"><span className="text-white/60">{k}</span><span className="text-gold">{v}</span></div>; }
function Stat({k,v}:{k:string;v:string}) { return <div className="rounded-xl bg-white/5 p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">{k}</div><div className="font-display text-xl mt-1 text-gold">{v}</div></div>; }
