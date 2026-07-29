import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { useMyBookings } from "@/lib/api";
import { LiveTracking } from "@/components/boujee/LiveTracking";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/tracking")({
  head: () => ({ meta: [{ title: "Live tracking — Boujee Book" }] }),
  validateSearch: (s: Record<string, unknown>): { booking?: string } => ({
    booking: typeof s.booking === "string" ? s.booking : undefined,
  }),
  component: Tracking,
});

function Tracking() {
  const { booking: bookingParam } = Route.useSearch();
  const { data, isLoading } = useMyBookings();
  const bookingId = bookingParam ?? data?.upcoming[0]?.booking.id ?? null;

  if (isLoading && !bookingParam) {
    return (
      <AppShell>
        <div className="min-h-[600px] grid place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </AppShell>
    );
  }

  if (!bookingId) {
    return (
      <AppShell>
        <div className="min-h-[600px] flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="text-sm text-muted-foreground">Nothing to track — book an appointment first.</div>
          <Link to="/app/search" className="px-5 py-3 rounded-full bg-ink text-white text-sm font-medium">Find a pro</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <LiveTracking bookingId={bookingId} backHref="/app/bookings" />
      <div className="h-6" />
    </AppShell>
  );
}
