import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { WaiterPageShell } from "@/components/waiter/waiter-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { findOrderById } from "@/server/db/repositories/order.repository";

const OrderDetailPanel = dynamic(
  () =>
    import("@/components/orders/order-detail-panel.client").then(
      (mod) => mod.OrderDetailPanel,
    ),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
  },
);

type OrderDetailContentProps = {
  orderId: string;
};

export async function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const order = await findOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <WaiterPageShell title={`Order · ${order.tableLabel}`}>
      <OrderDetailPanel
        order={order}
        backHref="/waiter/orders"
        backLabel="Back to orders"
      />
    </WaiterPageShell>
  );
}
