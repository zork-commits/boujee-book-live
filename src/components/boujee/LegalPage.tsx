import type { ReactNode } from "react";
import { WebNav } from "@/components/boujee/WebNav";
import { WebFooter } from "@/components/boujee/WebFooter";

export type LegalSection = { id?: string; heading: string; body: ReactNode };

/** Shared shell for Privacy / Terms / Accessibility. */
export function LegalPage({ title, updated, intro, sections }: {
  title: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="bg-ink text-white pt-40 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Legal</div>
          <h1 className="font-display text-5xl lg:text-7xl">{title}</h1>
          <div className="mt-4 text-white/50 text-sm">Last updated: {updated}</div>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 space-y-8 text-sm leading-relaxed text-muted-foreground">
          {intro && <p>{intro}</p>}
          {sections.map((s, i) => (
            <div key={s.heading} id={s.id}>
              <h2 className="font-display text-xl text-ink mb-2">{i + 1}. {s.heading}</h2>
              <div className="space-y-3">{s.body}</div>
            </div>
          ))}
        </div>
      </section>
      <WebFooter />
    </main>
  );
}
