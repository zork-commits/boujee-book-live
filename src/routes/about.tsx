import { createFileRoute } from "@tanstack/react-router";
import { WebNav } from "@/components/groom/WebNav";
import { WebFooter } from "@/components/groom/WebFooter";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — GROOM™" }, { name: "description", content: "GROOM is the operating system for personal care." }] }),
  component: About,
});

function About() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="relative bg-ink text-white pt-40 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Our Mission</div>
          <h1 className="font-display text-5xl lg:text-8xl leading-[0.95]">Personal care, <em className="text-gold not-italic">elevated.</em></h1>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-3 gap-8">
          {[
            { k:"2023", v:"Founded in Brooklyn" },
            { k:"6,240", v:"Verified professionals" },
            { k:"142", v:"Cities & growing" },
            { k:"$22M", v:"Series A" },
            { k:"71%", v:"Gross margin" },
            { k:"4.97★", v:"Average rating" },
          ].map(s=>(
            <div key={s.v} className="rounded-3xl border border-border p-8">
              <div className="font-display text-5xl text-gold">{s.k}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24 bg-cream">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Leadership</div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {n:"Mira Adler",r:"CEO",img:"1494790108377-be9c29b29330"},
              {n:"Devon Rios",r:"CTO",img:"1535713875002-d1d0cf377fde"},
              {n:"Saiko Tanaka",r:"COO",img:"1580489944761-15a19d654956"},
              {n:"Eli Brooks",r:"CFO",img:"1507081323647-4d250478b919"},
            ].map(p=>(
              <div key={p.n} className="text-center">
                <div className="aspect-square rounded-3xl overflow-hidden mb-3"><img src={`https://images.unsplash.com/photo-${p.img}?w=400&q=80`} alt={p.n} className="h-full w-full object-cover" /></div>
                <div className="font-display text-xl">{p.n}</div>
                <div className="text-xs text-muted-foreground">{p.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WebFooter />
    </main>
  );
}
