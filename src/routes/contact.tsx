import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WebNav } from "@/components/boujee/WebNav";
import { WebFooter } from "@/components/boujee/WebFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Boujee Book™" }] }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${form.name || "the website"}${form.company ? ` (${form.company})` : ""}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}${form.email ? ` · ${form.email}` : ""}`);
    window.location.href = `mailto:help@boujeebook.app?subject=${subject}&body=${body}`;
  };

  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="bg-ink text-white pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Contact</div>
          <h1 className="font-display text-5xl lg:text-7xl">Let's talk.</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-2 gap-12">
          <form className="space-y-5" onSubmit={submit}>
            {([["Name","text","name"],["Email","email","email"],["Company","text","company"]] as const).map(([l,t,k])=>(
              <div key={l}>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">{l}</label>
                <input type={t} value={form[k]} onChange={set(k)} required={k !== "company"} className="mt-2 w-full border-b border-ink/20 bg-transparent py-3 focus:outline-none focus:border-gold" />
              </div>
            ))}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea rows={4} value={form.message} onChange={set("message")} required className="mt-2 w-full border-b border-ink/20 bg-transparent py-3 focus:outline-none focus:border-gold" />
            </div>
            <button type="submit" className="px-6 py-3 rounded-full bg-ink text-white">Send Message</button>
          </form>
          <div className="space-y-8">
            {[
              ["Press","press@boujeebook.app"],
              ["Investors","ir@boujeebook.app"],
              ["Partnerships","partners@boujeebook.app"],
              ["Support","help@boujeebook.app"],
              ["HQ","68 Jay Street, Brooklyn NY 11201"],
            ].map(([l,v])=>(
              <div key={l}>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
                <div className="font-display text-2xl mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WebFooter />
    </main>
  );
}
