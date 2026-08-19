import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, deleteOrder } from "@/lib/admin.functions";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type Package = Tables<"packages">;

const STATUSES = ["pending", "confirmed", "done", "cancelled"] as const;

export function OrdersTab({ orders, packages }: { orders: Order[]; packages: Package[] }) {
  const qc = useQueryClient();
  const setStatus = useServerFn(updateOrderStatus);
  const remove = useServerFn(deleteOrder);

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: (typeof STATUSES)[number] }) => setStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Order deleted");
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (orders.length === 0) {
    return <p className="text-sm text-[#9b93ad]">No orders yet.</p>;
  }

  const packageName = (id: string | null) =>
    packages.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Orders ({orders.length})</h2>
      {orders.map((o) => (
        <div key={o.id} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="text-sm">
              <p className="font-medium text-white">{o.customer_name}</p>
              <p className="text-[#9b93ad]">{o.phone}</p>
              <p className="mt-1 text-[#cfc9db]">{packageName(o.package_id)}</p>
              {o.note ? <p className="mt-1 text-xs text-[#6f6880]">{o.note}</p> : null}
              <p className="mt-1 text-[11px] text-[#6f6880]">
                {o.created_at ? new Date(o.created_at).toLocaleString() : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => statusMutation.mutate({ id: o.id, status: s })}
                  className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                    o.status === s
                      ? "bg-[#ff3b9d] text-white"
                      : "border border-[#2a2438] text-[#9b93ad] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400"
                onClick={() => deleteMutation.mutate(o.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}