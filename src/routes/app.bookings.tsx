import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { useMyBookings, useCancelBooking, useSubmitReview, fmtWhen } from "@/lib/api";
import { MapPin, MessageSquare, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/bookings")({
  component: Bookings,
});

function Bookings() {
  const [tab, setTab] = useState<"up"|"past">("up");
  const { data, isLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3"><h1 className="font-display text-3xl">Bookings</h1></header>
      <div className="px-5 mt-2 grid grid-cols-2 gap-1 p-1 rounded-full bg-cream border border-border">
        <button onClick={()=>setTab("up")} className={`py-2 rounded-full text-xs ${tab==="up"?"bg-ink text-white":""}`}>Upcoming</button>
        <button onClick={()=>setTab("past")} className={`py-2 rounded-full text-xs ${tab==="past"?"bg-ink text-white":""}`}>Past</button>
      </div>

      <div className="px-5 mt-5 space-y-3 pb-4">
        {isLoading && <div className="py-16 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}

        {tab==="up" && (data?.upcoming ?? []).map(a=>(
          <div key={a.booking.id} className="rounded-2xl border border-border overflow-hidden">
            <div className="p-4 flex gap-3">
              <img src={a.proAvatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-base truncate">{a.proName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{a.booking.serviceName} · {a.booking.mins}min</div>
                <div className="text-xs mt-1">{fmtWhen(a.booking.scheduledAt)}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-ink h-fit capitalize">{a.booking.status}</span>
            </div>
            <div className="border-t border-border grid grid-cols-3 text-xs">
              <Link to="/app/tracking" search={{ booking: a.booking.id }} className="py-3 text-center inline-flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />Track</Link>
              <Link to="/app/messages" search={{ to: a.proId }} className="py-3 border-x border-border inline-flex items-center justify-center gap-1"><MessageSquare className="h-3 w-3" />Message</Link>
              <button
                onClick={()=>cancelBooking.mutate(a.booking.id)}
                disabled={cancelBooking.isPending}
                className="py-3 text-destructive disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
        {tab==="up" && !isLoading && (data?.upcoming.length ?? 0) === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Nothing booked yet.
            <Link to="/app/search" className="block mt-3 text-foreground underline underline-offset-4">Find a pro</Link>
          </div>
        )}

        {tab==="past" && (data?.past ?? []).map(p=>(
          <PastBooking key={p.booking.id} item={p} />
        ))}
        {tab==="past" && !isLoading && (data?.past.length ?? 0) === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No past appointments yet.</div>
        )}
      </div>
      <AppTabs />
    </AppShell>
  );
}

type BookingItem = NonNullable<ReturnType<typeof useMyBookings>["data"]>["past"][number];

function PastBooking({ item }: { item: BookingItem }) {
  const submitReview = useSubmitReview();
  const [hover, setHover] = useState(0);
  const canRate = item.booking.status === "completed" && item.myRating == null;

  return (
    <div className="p-4 rounded-2xl border border-border flex gap-3">
      <img src={item.proAvatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <div className="font-display text-base truncate">{item.proName}</div>
        <div className="text-[11px] text-muted-foreground truncate">{item.booking.serviceName}</div>
        <div className="text-xs mt-1 flex items-center gap-3">
          <span>{fmtWhen(item.booking.scheduledAt)}</span>
          {item.booking.status === "cancelled" && <span className="text-destructive text-[10px] uppercase tracking-widest">Cancelled</span>}
          {item.myRating != null && (
            <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-gold text-gold" />{item.myRating}</span>
          )}
          {canRate && (
            <span className="inline-flex items-center gap-0.5">
              {[1,2,3,4,5].map(r=>(
                <button
                  key={r}
                  onMouseEnter={()=>setHover(r)}
                  onMouseLeave={()=>setHover(0)}
                  onClick={()=>submitReview.mutate({ bookingId: item.booking.id, rating: r })}
                  disabled={submitReview.isPending}
                  aria-label={`Rate ${r} stars`}
                >
                  <Star className={`h-3.5 w-3.5 ${r <= hover ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                </button>
              ))}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">${item.booking.price}</div>
        <Link to="/app/book" search={{ pro: item.proId, service: item.booking.serviceId ?? undefined }} className="inline-block text-[10px] mt-1 px-2 py-1 rounded-full border border-border">Rebook</Link>
      </div>
    </div>
  );
}
