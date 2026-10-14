import { ClipboardList, LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WaiterPageShell } from "@/components/waiter/waiter-page-shell";
import { requireRole } from "@/server/auth/guards";
import { listOrders } from "@/server/db/repositories/order.repository";

const OrdersFilter = dynamic(
  () =>
    import("@/components/orders/orders-filter.client").then(
      (mod) => mod.OrdersFilter,
    ),
  { loading: () => <Skeleton className="h-10 w-44" /> },
);

type OrdersContentProps = {
  filterParam?: string;
};

export async function OrdersContent({ filterParam }: OrdersContentProps) {
  await requireRole("waiter");
  const showAll = filterParam === "all";
  const orders = await listOrders({ activeOnly: !showAll });
  const visibleOrders = showAll
    ? orders
    : [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <WaiterPageShell
      title="Orders"
      description={
        showAll
          ? "Every order, newest first."
          : `${orders.length} pending order${orders.length === 1 ? "" : "s"} — complete each one once the customer pays.`
      }
      actions={
        <>
          <Suspense fallback={<Skeleton className="h-10 w-44" />}>
            <OrdersFilter activeLabel="Pending" allLabel="History" />
          </Suspense>
          <Button asChild>
            <Link href="/waiter/pos">
              <LayoutGrid />
              New order
            </Link>
          </Button>
        </>
      }
    >
      {visibleOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={showAll ? "No orders yet" : "No pending orders"}
          description="Orders you take from the POS will show up here."
          action={
            <Button asChild size="sm">
              <Link href="/waiter/pos">Open POS</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              detailHref={`/waiter/orders/${order.id}`}
              showStatus={showAll}
            />
          ))}
        </div>
      )}
    </WaiterPageShell>
  );
}
