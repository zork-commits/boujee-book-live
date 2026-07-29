import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { useNotifications, useMarkAllRead, fmtWhen } from "@/lib/api";
import { ChevronLeft, Calendar, MessageCircle, Star, BadgeCheck, AlertTriangle, Bell, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Boujee Book" }] }),
  component: Notifications,
});

const ICONS: Record<string, typeof Bell> = {
  booking: Calendar,
  message: MessageCircle,
  review: Star,
  verification: BadgeCheck,
  dispute: AlertTriangle,
  system: Bell,
};

function Notifications() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const nav = useNavigate();

  // Opening the feed clears the unread badge.
  useEffect(() => {
    if (data?.some((n) => !n.readAt)) markAllRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => history.back()} aria-label="Back" className="h-9 w-9 grid place-items-center rounded-full border border-border"><ChevronLeft className="h-4 w-4" /></button>
        <h1 className="font-display text-2xl">Notifications</h1>
      </header>

      <div className="px-3 mt-2 pb-4">
        {isLoading && <div className="py-16 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            Nothing yet — booking updates and messages land here.
          </div>
        )}
        <div className="divide-y divide-border">
          {(data ?? []).map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <button
                key={n.id}
                onClick={() => { if (n.href) nav({ href: n.href }); }}
                className="w-full flex items-start gap-3 px-2 py-3.5 text-left"
              >
                <div className={`h-9 w-9 rounded-full grid place-items-center shrink-0 ${n.readAt ? "bg-cream" : "bg-gold/20"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${n.readAt ? "" : "font-medium"}`}>{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</div>}
                </div>
                <div className="text-[10px] text-muted-foreground shrink-0 mt-1">{fmtWhen(n.createdAt)}</div>
              </button>
            );
          })}
        </div>
        {(data?.length ?? 0) > 0 && (
          <div className="mt-6 text-center">
            <Link to="/app" className="text-xs text-muted-foreground underline underline-offset-4">Back to home</Link>
          </div>
        )}
      </div>
      <AppTabs />
    </AppShell>
  );
}
