import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { adminListAll, getMyRole } from "@/lib/admin.functions";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ServicesTab } from "@/components/admin/ServicesTab";
import { PackagesTab } from "@/components/admin/PackagesTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { DashboardTab } from "@/components/admin/DashboardTab";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — ITFair" },
      { name: "description", content: "Manage ITFair services, packages, orders and translations." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Panel — ITFair" },
      { property: "og:description", content: "Internal management panel for the ITFair site." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchRole = useServerFn(getMyRole);
  const fetchData = useServerFn(adminListAll);

  const roleQuery = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole({}) });
  const dataQuery = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => fetchData({}),
    enabled: roleQuery.data?.isAdmin === true,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-[#080512] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">ITFair Admin</h1>
            <p className="text-sm text-[#9b93ad]">Manage content, pricing and orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate({ to: "/" })}>
              View site
            </Button>
            <Button variant="ghost" className="text-[#9b93ad]" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>

        {roleQuery.isLoading ? (
          <p className="text-sm text-[#9b93ad]">Loading…</p>
        ) : !roleQuery.data?.isAdmin ? (
          <div className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-6">
            <h2 className="font-semibold text-white">No admin access</h2>
            <p className="mt-1 text-sm text-[#9b93ad]">
              This account doesn't have the admin role. Ask an existing admin to grant access.
            </p>
          </div>
        ) : dataQuery.isLoading || !dataQuery.data ? (
          <p className="text-sm text-[#9b93ad]">Loading data…</p>
        ) : (
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6 bg-[#120e1e]">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="settings">Site text</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <DashboardTab 
                orders={dataQuery.data.orders} 
                services={dataQuery.data.services}
                packages={dataQuery.data.packages}
              />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersTab orders={dataQuery.data.orders} packages={dataQuery.data.packages} />
            </TabsContent>
            <TabsContent value="services">
              <ServicesTab services={dataQuery.data.services} />
            </TabsContent>
            <TabsContent value="packages">
              <PackagesTab packages={dataQuery.data.packages} />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab settings={dataQuery.data.settings} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}