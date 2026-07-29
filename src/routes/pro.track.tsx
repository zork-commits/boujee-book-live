import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { LiveTracking } from "@/components/boujee/LiveTracking";

export const Route = createFileRoute("/pro/track")({
  head: () => ({ meta: [{ title: "Live tracking — Boujee Book Pro" }] }),
  validateSearch: (s: Record<string, unknown>): { booking?: string } => ({
    booking: typeof s.booking === "string" ? s.booking : undefined,
  }),
  component: ProTrack,
});

function ProTrack() {
  const { booking } = Route.useSearch();

  if (!booking) {
    return (
      <AppShell>
        <div className="min-h-[600px] flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="text-sm text-muted-foreground">Open tracking from an appointment on your schedule.</div>
          <Link to="/pro" className="px-5 py-3 rounded-full bg-ink text-white text-sm font-medium">Back to today</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <LiveTracking bookingId={booking} backHref="/pro" />
      <div className="h-6" />
    </AppShell>
  );
}
