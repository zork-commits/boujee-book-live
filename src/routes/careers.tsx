import { createFileRoute } from "@tanstack/react-router";
import { WebNav } from "@/components/groom/WebNav";
import { WebFooter } from "@/components/groom/WebFooter";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers — GROOM™" }] }),
  component: Careers,
});

const ROLES = [
  { t:"Staff iOS Engineer", l:"Brooklyn / Remote", d:"Engineering" },
  { t:"Sr. Backend Engineer (Payments)", l:"NYC", d:"Engineering" },
  { t:"Head of Pro Marketing", l:"Remote", d:"Marketing" },
  { t:"Trust & Safety Lead", l:"NYC", d:"Operations" },
  { t:"City Launcher — Miami", l:"Miami, FL", d:"Operations" },
  { t:"Sr. Product Designer", l:"Remote", d:"Design" },
];

function Careers() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="bg-ink text-white pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Careers</div>
          <h1 className="font-display text-5xl lg:text-7xl">Build the future of beauty.</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 divide-y divide-border border-y border-border">
          {ROLES.map(r=>(
            <div key={r.t} className="py-6 flex items-center justify-between gap-4">
              <div>
                <div className="font-display text-xl">{r.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.d} · {r.l}</div>
              </div>
              <button className="text-sm px-4 py-2 rounded-full border border-ink/20">Apply</button>
            </div>
          ))}
        </div>
      </section>
      <WebFooter />
    </main>
  );
}
