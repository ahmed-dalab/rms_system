import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { OrdersList } from "@/components/orders/orders-list";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/server/auth/guards";
import { listOrders } from "@/server/db/repositories/order.repository";

const OrdersFilter = dynamic(
  () =>
    import("@/components/orders/orders-filter.client").then(
      (mod) => mod.OrdersFilter,
    ),
  { loading: () => <Skeleton className="h-10 w-36" /> },
);

type AdminOrdersContentProps = {
  filterParam?: string;
};

export async function AdminOrdersContent({
  filterParam,
}: AdminOrdersContentProps) {
  await requireRole("admin");
  const activeOnly = filterParam !== "all";
  const orders = await listOrders({ activeOnly });

  return (
    <AdminPageShell
      title="Orders"
      description="Monitor floor activity and update order status."
      actions={
        <Suspense fallback={<Skeleton className="h-10 w-36" />}>
          <OrdersFilter />
        </Suspense>
      }
    >
      <OrdersList orders={orders} detailBasePath="/admin/orders" />
    </AdminPageShell>
  );
}
