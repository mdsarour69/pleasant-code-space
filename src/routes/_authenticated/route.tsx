import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Session storage can hydrate asynchronously (new domains, first load), so wait
// briefly for a persisted session before deciding the visitor is signed out.
async function waitForSession() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return null;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await waitForSession();
    if (session?.user) return { user: session.user };
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) return { user: data.user };
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
