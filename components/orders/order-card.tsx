import Link from "next/link";

import { ElapsedTime } from "@/components/orders/elapsed-time.client";
import { OrderAdvanceButton } from "@/components/orders/order-advance-button.client";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { isOrderClosed } from "@/lib/constants/order-flow";
import { formatMoney } from "@/lib/format/currency";
import type { OrderRecord } from "@/types/order";

const PREVIEW_LINES = 3;
const LATE_AFTER_MINUTES = 20;

type OrderCardProps = {
  order: OrderRecord;
  detailHref: string;
  showStatus?: boolean;
};

export function OrderCard({ order, detailHref, showStatus }: OrderCardProps) {
  const closed = isOrderClosed(order.status);
  const extraLines = order.items.length - PREVIEW_LINES;
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={detailHref} className="block px-4 pt-3.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight">
              Table {order.tableLabel}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {order.waiterName} · {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
          {showStatus ? (
            <OrderStatusBadge status={order.status} />
          ) : (
            <ElapsedTime
              since={order.createdAt}
              warnAfterMinutes={closed ? undefined : LATE_AFTER_MINUTES}
            />
          )}
        </div>

        <ul className="mt-3 space-y-1 text-sm">
          {order.items.slice(0, PREVIEW_LINES).map((line) => (
            <li
              key={`${line.menuItemId}-${line.name}`}
              className="flex gap-2"
            >
              <span className="w-6 shrink-0 font-semibold text-primary tabular-nums">
                {line.quantity}×
              </span>
              <span className="truncate">{line.name}</span>
            </li>
          ))}
          {extraLines > 0 ? (
            <li className="pl-8 text-xs text-muted-foreground">
              +{extraLines} more
            </li>
          ) : null}
        </ul>

        {order.notes ? (
          <p className="mt-3 line-clamp-2 rounded-md bg-muted px-2.5 py-1.5 text-xs text-accent-foreground">
            {order.notes}
          </p>
        ) : null}
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <span className="text-sm font-bold tabular-nums">
          {formatMoney(order.subtotal)}
        </span>
        {closed ? (
          <span className="text-xs text-muted-foreground">
            {new Date(order.updatedAt).toLocaleString()}
          </span>
        ) : (
          <OrderAdvanceButton orderId={order.id} status={order.status} />
        )}
      </div>
    </article>
  );
}
