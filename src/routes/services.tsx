import { createFileRoute, Link } from "@tanstack/react-router";
import { WebNav } from "@/components/boujee/WebNav";
import { WebFooter } from "@/components/boujee/WebFooter";
import { CATEGORIES } from "@/lib/mock";
import { CategoryIcon } from "@/components/boujee/CategoryIcon";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services — Boujee Book™" }, { name: "description", content: "Barbers, hairstylists, nails, makeup, lashes, esthetics, massage." }] }),
  component: Services,
});

const PRICING_LIST = [
  { c:"Barbers", items:[["Signature Cut","$55"],["Skin Fade + Beard","$95"],["Hot Towel Shave","$60"]] },
  { c:"Hairstylists", items:[["Cut & Style","$120"],["Full Color","$240"],["Balayage","$320"]] },
  { c:"Nails", items:[["Gel-X Full Set","$85"],["Spa Pedicure","$65"],["Nail Art","+$20"]] },
  { c:"Makeup", items:[["Soft Glam","$180"],["Bridal Day-of","$550"],["Editorial","$420"]] },
  { c:"Lashes", items:[["Classic Set","$160"],["Volume Set","$240"],["Fill","$85"]] },
  { c:"Massage", items:[["60 min Deep Tissue","$140"],["90 min Sports","$210"]] },
];



function Services() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="bg-ink text-white pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">All Services</div>
          <h1 className="font-display text-5xl lg:text-7xl">Find your craft.</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(c => (
            <Link key={c.key} to="/app/search" search={{ cat: c.key }} className="aspect-square rounded-3xl bg-cream border border-border p-6 flex flex-col justify-between hover:shadow-luxury">
              <CategoryIcon category={c.key} className="h-9 w-9 text-gold" strokeWidth={1.5} />
              <div className="font-display text-2xl">{c.label}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRICING_LIST.map(g => (
            <div key={g.c} className="rounded-3xl bg-background border border-border p-6">
              <div className="font-display text-2xl mb-4">{g.c}</div>
              <ul className="divide-y divide-border">
                {g.items.map(([n,p]) => (
                  <li key={n} className="py-3 flex justify-between text-sm"><span>{n}</span><span className="font-medium">{p}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <WebFooter />
    </main>
  );
}
