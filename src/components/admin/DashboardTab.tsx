import { type Tables } from "@/integrations/supabase/types";
import { LayoutDashboard, ShoppingCart, Package, Settings, Star } from "lucide-react";

type Order = Tables<"orders">;
type Service = Tables<"services">;
type Pkg = Tables<"packages">;

interface DashboardTabProps {
  orders: Order[];
  services: Service[];
  packages: Pkg[];
}

export function DashboardTab({ orders, services, packages }: DashboardTabProps) {
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeServices = services.filter((s) => s.active).length;
  const activePackages = packages.filter((p) => p.active).length;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-400" },
    { label: "Pending Orders", value: pendingOrders, icon: Star, color: "text-yellow-400" },
    { label: "Active Services", value: activeServices, icon: LayoutDashboard, color: "text-pink-400" },
    { label: "Active Packages", value: activePackages, icon: Package, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-[#1a1529] p-2 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-[#9b93ad]">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-6">
        <h3 className="mb-4 font-semibold text-white flex items-center gap-2">
          <Settings size={18} className="text-[#ff3b9d]" />
          Admin Overview
        </h3>
        <p className="text-sm text-[#9b93ad] leading-relaxed">
          Welcome to the ITFair Admin Panel. Use the tabs above to manage your customer orders, 
          update the services displayed on the homepage, adjust package pricing, and translate 
          site text for your global audience.
        </p>
        <div className="mt-6 flex gap-4">
           <div className="flex-1 rounded-lg bg-[#0d0a17] p-3 border border-[#2a2438]">
             <p className="text-[10px] uppercase tracking-wider text-[#6f6880] font-bold">Recent Activity</p>
             <p className="mt-1 text-sm text-white">
               {orders.length > 0 
                ? `Last order from ${orders[0].customer_name} (${new Date(orders[0].created_at || '').toLocaleDateString()})` 
                : 'No recent orders.'}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
