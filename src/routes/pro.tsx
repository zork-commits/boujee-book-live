import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMe } from "@/server/auth";

export const Route = createFileRoute("/pro")({
  beforeLoad: async ({ location }) => {
    const user = await getMe();
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    // Onboarding is public to signed-in customers; everything else needs a pro profile.
    if (!user.proId && location.pathname !== "/pro/onboarding") {
      throw redirect({ to: "/pro/onboarding" });
    }
    return { user };
  },
  component: () => <Outlet />,
});
