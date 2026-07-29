import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLiveTracking, useShareLocation, useStopSharing, useSetBookingStatus, fmtWhen } from "@/lib/api";
import { LiveMap, type MapPoint } from "@/components/boujee/LiveMap";
import { ChevronLeft, MessageSquare, Shield, Loader2, LocateFixed, Navigation, Check } from "lucide-react";
import { toast } from "sonner";

const STALE_AFTER_MS = 2 * 60_000;
const STATUS_ORDER = ["pending", "confirmed", "en_route", "arrived", "completed"] as const;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Shared Uber-style tracking screen; the server tells us which side we're on. */
export function LiveTracking({ bookingId, backHref }: { bookingId: string; backHref: string }) {
  const { data, isLoading } = useLiveTracking(bookingId);
  const shareLocation = useShareLocation();
  const stopSharing = useStopSharing();
  const setStatus = useSetBookingStatus();
  const [sharing, setSharing] = useState(false);
  const watchRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);

  const stopWatch = () => {
    if (watchRef.current != null) {
      navigator.geolocation?.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const toggleShare = () => {
    if (sharing) {
      stopWatch();
      setSharing(false);
      stopSharing.mutate(bookingId);
      return;
    }
    if (!navigator.geolocation) {
      toast("Location isn't available in this browser");
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // Throttle to one fix per 5s — plenty for a live map, gentle on battery.
        if (Date.now() - lastSentRef.current < 5_000) return;
        lastSentRef.current = Date.now();
        shareLocation.mutate({
          bookingId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          heading: pos.coords.heading ?? undefined,
        });
      },
      () => {
        toast("Location permission denied", { description: "Enable location access to share where you are." });
        stopWatch();
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5_000 },
    );
    setSharing(true);
  };

  // Stop the GPS watch when leaving the screen.
  useEffect(() => () => stopWatch(), []);

  if (isLoading || !data) {
    return <div className="min-h-[600px] grid place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const { booking, myRole, pro, customerName, proLocation, customerLocation } = data;
  const iAmPro = myRole === "pro";
  const otherName = iAmPro ? customerName : pro?.name ?? "Your pro";
  const isStale = (iso: string) => Date.now() - new Date(iso).getTime() > STALE_AFTER_MS;

  const points: MapPoint[] = [];
  if (proLocation) points.push({ key: "pro", lat: proLocation.lat, lng: proLocation.lng, label: pro?.name?.split(" ")[0] ?? "Pro", variant: "gold", stale: isStale(proLocation.updatedAt) });
  if (customerLocation) points.push({ key: "customer", lat: customerLocation.lat, lng: customerLocation.lng, label: customerName.split(" ")[0], variant: "ink", stale: isStale(customerLocation.updatedAt) });

  const bothLive = proLocation && customerLocation && !isStale(proLocation.updatedAt) && !isStale(customerLocation.updatedAt);
  const distanceKm = bothLive ? haversineKm(proLocation!, customerLocation!) : null;
  const etaMin = distanceKm != null ? Math.max(1, Math.round((distanceKm / 25) * 60)) : null; // ~25 km/h city pace

  const statusIdx = STATUS_ORDER.indexOf(booking.status as (typeof STATUS_ORDER)[number]);
  const active = ["confirmed", "en_route", "arrived"].includes(booking.status);
  const headline =
    booking.status === "cancelled" ? "Booking cancelled"
    : booking.status === "completed" ? "Appointment completed"
    : booking.status === "arrived" ? (iAmPro ? "You've arrived" : `${otherName.split(" ")[0]} has arrived`)
    : booking.status === "en_route" ? (etaMin != null ? `Arriving in ~${etaMin} min` : (iAmPro ? "You're on the way" : `${otherName.split(" ")[0]} is on the way`))
    : booking.status === "confirmed" ? fmtWhen(booking.scheduledAt)
    : "Awaiting confirmation";

  return (
    <>
      <div className="relative h-[46vh] lg:h-[380px] bg-cream overflow-hidden">
        {points.length > 0
          ? <LiveMap points={points} className="absolute inset-0 h-full w-full" />
          : (
            <div className="absolute inset-0 grid place-items-center px-10 text-center">
              <div className="text-sm text-muted-foreground">
                {active ? "No one is sharing a live location yet — flip the toggle below." : "Live tracking turns on while a booking is active."}
              </div>
            </div>
          )}
        <div className="absolute top-4 left-4 z-[500]">
          <Link to={backHref} className="h-9 w-9 rounded-full bg-background grid place-items-center shadow-luxury"><ChevronLeft className="h-4 w-4" /></Link>
        </div>
        <div className="absolute top-4 right-4 z-[500] px-3 py-1.5 rounded-full bg-gold text-ink text-[10px] tracking-widest uppercase font-semibold">Live Tracking</div>
      </div>

      <div className="px-5 -mt-8 relative z-[600]">
        <div className="rounded-3xl bg-background border border-border shadow-luxury p-5">
          <div className="text-[10px] uppercase tracking-widest text-gold">{booking.status.replace("_", " ")}</div>
          <div className="font-display text-3xl mt-1">{headline}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {iAmPro ? `${customerName} · ${booking.serviceName}` : `${pro?.name} · ${booking.serviceName}`}
            {distanceKm != null && ` · ${distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`} apart`}
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "Booking placed", at: fmtWhen(booking.createdAt), idx: 0 },
              { label: "Confirmed", at: statusIdx >= 1 ? "" : "—", idx: 1 },
              { label: iAmPro ? "On the way" : `${otherName.split(" ")[0]} on the way`, at: statusIdx >= 2 ? "" : "—", idx: 2 },
              { label: "Arrived", at: statusIdx >= 3 ? "" : "—", idx: 3 },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${statusIdx >= s.idx ? "bg-gold" : "bg-border"} ${statusIdx === s.idx && active ? "ring-4 ring-gold/30" : ""}`} />
                <div className="flex-1 text-sm">{s.label}</div>
                <div className="text-[11px] text-muted-foreground">{s.at}</div>
              </div>
            ))}
          </div>

          {active && (
            <button
              onClick={toggleShare}
              className={`mt-5 w-full py-3 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 ${sharing ? "bg-gold text-ink" : "border border-border"}`}
            >
              <LocateFixed className={`h-4 w-4 ${sharing ? "animate-pulse" : ""}`} />
              {sharing ? "Sharing your live location — tap to stop" : "Share my live location"}
            </button>
          )}

          {iAmPro && booking.status === "pending" && (
            <button onClick={() => setStatus.mutate({ id: booking.id, status: "confirmed" })} disabled={setStatus.isPending} className="mt-5 w-full py-3 rounded-full bg-gold text-ink text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Check className="h-4 w-4" />Confirm this booking
            </button>
          )}

          {iAmPro && active && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {booking.status === "confirmed" && (
                <button onClick={() => setStatus.mutate({ id: booking.id, status: "en_route" })} disabled={setStatus.isPending} className="col-span-2 py-3 rounded-full bg-ink text-white text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50">
                  <Navigation className="h-4 w-4" />I'm on my way
                </button>
              )}
              {booking.status === "en_route" && (
                <button onClick={() => setStatus.mutate({ id: booking.id, status: "arrived" })} disabled={setStatus.isPending} className="col-span-2 py-3 rounded-full bg-ink text-white text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50">
                  <Check className="h-4 w-4" />I've arrived
                </button>
              )}
              {booking.status === "arrived" && (
                <button onClick={() => setStatus.mutate({ id: booking.id, status: "completed" })} disabled={setStatus.isPending} className="col-span-2 py-3 rounded-full bg-gold text-ink text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50">
                  <Check className="h-4 w-4" />Complete appointment
                </button>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3 pt-5 border-t border-border">
            {pro && !iAmPro && <img src={pro.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="font-display text-base truncate">{otherName}</div>
              <div className="text-[11px] text-muted-foreground">{iAmPro ? "Client" : `${pro?.craft} · ${pro?.city}`}</div>
            </div>
            <Link
              to="/app/messages"
              search={!iAmPro && pro ? { to: pro.id } : undefined}
              className="h-10 w-10 rounded-full bg-cream grid place-items-center"
              aria-label={`Message ${otherName}`}
            >
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Shield className="h-3 w-3" />Location is shared only during this booking and deleted when it ends.
          </div>
        </div>
      </div>
    </>
  );
}
