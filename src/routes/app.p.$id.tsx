import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { getPro } from "@/fn/pros";
import { useFavorites, useToggleFavorite, useReportContent, fmtWhen } from "@/lib/api";
import { ChevronLeft, Star, MapPin, BadgeCheck, MessageSquare, Heart, Share2, Award, Flag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/p/$id")({
  loader: async ({ params }) => {
    const pro = await getPro({ data: { id: params.id } });
    if (!pro) throw notFound();
    return { pro };
  },
  component: ProfilePage,
  notFoundComponent: () => <div className="p-8">Pro not found</div>,
});

function ProfilePage() {
  const { pro } = Route.useLoaderData();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const favorited = favorites?.some((f) => f.id === pro.id) ?? false;

  return (
    <AppShell>
      <div className="relative">
        <img src={pro.cover} alt={pro.name} className="aspect-[4/3] w-full object-cover" />
        <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between">
          <Link to="/app/search" className="h-9 w-9 rounded-full bg-background/90 grid place-items-center"><ChevronLeft className="h-4 w-4" /></Link>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const url = window.location.href;
                const payload = { title: `${pro.name} — Boujee Book`, text: `Book ${pro.name}, ${pro.craft} in ${pro.city}`, url };
                if (navigator.share) {
                  await navigator.share(payload).catch(() => {});
                  return;
                }
                try {
                  await navigator.clipboard.writeText(url);
                  toast("Link copied", { description: `Share ${pro.name}'s profile anywhere.` });
                } catch {
                  toast("Share this profile", { description: url });
                }
              }}
              aria-label="Share profile"
              className="h-9 w-9 rounded-full bg-background/90 grid place-items-center"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleFavorite.mutate(pro.id)}
              className="h-9 w-9 rounded-full bg-background/90 grid place-items-center"
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${favorited ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>
        </div>
        <div className="absolute -bottom-8 left-5">
          <img src={pro.avatar} alt={pro.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-background" />
        </div>
      </div>

      <div className="px-5 pt-12">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl">{pro.name}</h1>
          {pro.verified && <BadgeCheck className="h-4 w-4 text-gold" />}
          {pro.elite && <span className="px-2 py-0.5 rounded-full bg-gold text-ink text-[9px] tracking-widest uppercase font-semibold">Elite</span>}
        </div>
        <div className="text-xs text-muted-foreground">{pro.craft} · {pro.years} yrs</div>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" />{pro.rating} ({pro.reviewCount})</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{pro.distance}mi · {pro.city}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {pro.tags.map(t=>(<span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cream border border-border">{t}</span>))}
        </div>
      </div>

      <section className="px-5 mt-6">
        <h2 className="font-display text-lg">Portfolio</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {pro.portfolio.map((src,i)=>(
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i===0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-background/90 text-[9px] uppercase tracking-widest">Before/After</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-display text-lg">Services</h2>
        <div className="mt-3 divide-y divide-border border border-border rounded-2xl">
          {pro.services.map(s=>(
            <div key={s.id} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">{s.mins} min</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">${s.price}</span>
                <Link to="/app/book" search={{ pro: pro.id, service: s.id }} className="text-[11px] px-3 py-1.5 rounded-full bg-ink text-white">Book</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-display text-lg">Reviews</h2>
        <div className="mt-3 space-y-3">
          {pro.reviews.length === 0 && (
            <div className="rounded-2xl border border-border p-4 text-xs text-muted-foreground">No reviews yet — be the first.</div>
          )}
          {pro.reviews.map(rv=>(
            <div key={rv.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{rv.reviewer}</div>
                <div className="flex">{Array.from({length:rv.rating}).map((_,j)=>(<Star key={j} className="h-3 w-3 fill-gold text-gold" />))}</div>
              </div>
              {rv.comment && <div className="text-xs text-muted-foreground mt-1">{rv.comment}</div>}
              <div className="text-[10px] text-muted-foreground mt-1">{fmtWhen(rv.createdAt)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 mb-32">
        <h2 className="font-display text-lg">Credentials</h2>
        <div className="mt-3 space-y-2">
          {pro.certifications.map(c=>(
            <div key={c} className="flex items-center gap-2 text-xs"><Award className="h-3.5 w-3.5 text-gold" />{c}</div>
          ))}
        </div>
        <ReportPro proId={pro.id} proName={pro.name} />
      </section>

      <ProFooter pro={pro} />
    </AppShell>
  );
}

function ReportPro({ proId, proName }: { proId: string; proName: string }) {
  const report = useReportContent();
  return (
    <button
      onClick={async () => {
        const res = await report.mutateAsync({ targetType: "pro", targetId: proId, reason: "Reported from profile" });
        toast(res.ok ? "Report received" : res.error, res.ok ? { description: `Our trust team will review ${proName}'s profile.` } : undefined);
      }}
      disabled={report.isPending}
      className="mt-6 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground disabled:opacity-50"
    >
      <Flag className="h-3 w-3" />Report this profile
    </button>
  );
}

function ProFooter({ pro }: { pro: { id: string; price: number } }) {
  return (
    <div className="sticky bottom-0 z-30 mt-auto border-t border-border bg-background/95 backdrop-blur-xl px-5 py-3 flex items-center gap-2">
      <Link to="/app/messages" search={{ to: pro.id }} className="h-12 w-12 rounded-full border border-border grid place-items-center" aria-label="Message pro"><MessageSquare className="h-4 w-4" /></Link>
      <Link to="/app/book" search={{ pro: pro.id }} className="flex-1 h-12 rounded-full bg-ink text-white grid place-items-center font-medium text-sm">Book — from ${pro.price}</Link>
    </div>
  );
}
