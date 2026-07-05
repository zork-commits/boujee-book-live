import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMe } from "@/server/auth";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ location }) => {
    const user = await getMe();
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user };
  },
  component: () => <Outlet />,
});
