import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatMoney } from "@/lib/format/currency";
import { formatShortDate, formatTime } from "@/lib/format/datetime";
import type { OrderRecord } from "@/types/order";

export function RecentOrdersPanel({ orders }: { orders: OrderRecord[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No orders yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-2 px-1 py-3 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">
                Table {order.tableLabel}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {order.waiterName}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(order.createdAt)} at{" "}
                {formatTime(order.createdAt)}
                {" · "}
                {order.items.length} line
                {order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="text-sm font-semibold tabular-nums">
                {formatMoney(order.subtotal)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
