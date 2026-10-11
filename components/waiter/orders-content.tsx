import dynamic from "next/dynamic";
import { Suspense } from "react";

import { OrdersList } from "@/components/orders/orders-list";
import { WaiterPageShell } from "@/components/waiter/waiter-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listOrders } from "@/server/db/repositories/order.repository";

const OrdersFilter = dynamic(
  () =>
    import("@/components/orders/orders-filter.client").then(
      (mod) => mod.OrdersFilter,
    ),
  { loading: () => <Skeleton className="h-9 w-40" /> },
);

type OrdersContentProps = {
  filterParam?: string;
};

export async function OrdersContent({ filterParam }: OrdersContentProps) {
  const activeOnly = filterParam !== "all";
  const orders = await listOrders({ activeOnly });

  return (
    <WaiterPageShell
      title="Orders"
      description="Track tickets from the POS and advance each order through service."
    >
      <div className="space-y-4">
        <Suspense fallback={<Skeleton className="h-9 w-40" />}>
          <OrdersFilter showPosLink />
        </Suspense>
        <OrdersList
          orders={orders}
          detailBasePath="/waiter/orders"
          emptyAction={{ href: "/waiter/pos", label: "Open POS" }}
        />
      </div>
    </WaiterPageShell>
  );
}
