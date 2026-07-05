import { createFileRoute } from "@tanstack/react-router";
import { WebNav } from "@/components/groom/WebNav";
import { WebFooter } from "@/components/groom/WebFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — GROOM™" }] }),
  component: () => <Legal title="Privacy Policy" />,
});

function Legal({ title }: { title: string }) {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="bg-ink text-white pt-40 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Legal</div>
          <h1 className="font-display text-5xl lg:text-7xl">{title}</h1>
          <div className="mt-4 text-white/50 text-sm">Last updated: June 24, 2026</div>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i}>
              <h2 className="font-display text-xl text-ink mb-2">§ {i+1}. Section heading</h2>
              <p>This is placeholder legal copy for demo purposes. Replace with counsel-approved language before launch.</p>
            </div>
          ))}
        </div>
      </section>
      <WebFooter />
    </main>
  );
}
