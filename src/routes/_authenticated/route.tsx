import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Retry briefly: right after login the session may still be settling in storage.
    for (let i = 0; i < 10; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});