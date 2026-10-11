import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { findOrderById } from "@/server/db/repositories/order.repository";

const OrderDetailPanel = dynamic(
  () =>
    import("@/components/orders/order-detail-panel.client").then(
      (mod) => mod.OrderDetailPanel,
    ),
  { loading: () => <Skeleton className="h-64 w-full" /> },
);

export async function AdminOrderDetailContent({ orderId }: { orderId: string }) {
  const order = await findOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <AdminPageShell title={`Order · ${order.tableLabel}`}>
      <OrderDetailPanel
        order={order}
        backHref="/admin/orders"
        backLabel="Back to orders"
      />
    </AdminPageShell>
  );
}
