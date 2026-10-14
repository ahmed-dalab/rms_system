import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/server/auth/guards";
import { findOrderById } from "@/server/db/repositories/order.repository";

const OrderDetailPanel = dynamic(
  () =>
    import("@/components/orders/order-detail-panel.client").then(
      (mod) => mod.OrderDetailPanel,
    ),
  { loading: () => <Skeleton className="h-64 w-full" /> },
);

export async function AdminOrderDetailContent({ orderId }: { orderId: string }) {
  await requireRole("admin");
  const order = await findOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <AdminPageShell
      title={`Table ${order.tableLabel}`}
      description={`Order placed ${new Date(order.createdAt).toLocaleString()}`}
    >
      <OrderDetailPanel
        order={order}
        backHref="/admin/orders"
        backLabel="Back to orders"
      />
    </AdminPageShell>
  );
}
