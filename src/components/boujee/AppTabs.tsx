import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Calendar, MessageCircle, User } from "lucide-react";

const TABS: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/search", label: "Search", icon: Search },
  { to: "/app/bookings", label: "Bookings", icon: Calendar },
  { to: "/app/messages", label: "Messages", icon: MessageCircle },
  { to: "/app/me", label: "Profile", icon: User },
];

export function AppTabs() {
  const pathname = useLocation({ select: (l) => l.pathname });
  return (
    <nav className="sticky bottom-0 z-30 mt-8 border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-1 pt-2 pb-3">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-1">
              <Icon className={`h-5 w-5 ${active ? "text-foreground" : "text-muted-foreground"}`} />
              <span className={`text-[10px] tracking-wide ${active ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</span>
              {active && <span className="h-1 w-1 -mt-0.5 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
