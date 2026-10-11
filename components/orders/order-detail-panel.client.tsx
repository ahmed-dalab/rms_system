"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/currency";
import {
  cancelOrderAction,
  updateOrderStatusAction,
  type OrderActionState,
} from "@/server/actions/order.actions";
import type { OrderRecord, OrderStatus } from "@/types/order";

const initialState: OrderActionState = { ok: false, message: "" };

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "served",
  served: "paid",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Start preparing",
  preparing: "Mark served",
  served: "Mark paid",
};

type OrderDetailPanelProps = {
  order: OrderRecord;
  backHref?: string;
  backLabel?: string;
};

export function OrderDetailPanel({
  order,
  backHref,
  backLabel = "Back to orders",
}: OrderDetailPanelProps) {
  const router = useRouter();
  const [statusState, statusAction, statusPending] = useActionState(
    updateOrderStatusAction,
    initialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelOrderAction,
    initialState,
  );

  const nextStatus = NEXT_STATUS[order.status];
  const isClosed = order.status === "paid" || order.status === "cancelled";

  useEffect(() => {
    if (statusState.ok || cancelState.ok) {
      router.refresh();
    }
  }, [statusState.ok, cancelState.ok, router]);

  return (
    <div className="space-y-5">
      {backHref ? (
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 w-fit">
          <Link href={backHref}>
            <ArrowLeft />
            {backLabel}
          </Link>
        </Button>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-lg font-semibold">Table {order.tableLabel}</p>
          <p className="text-sm text-muted-foreground">
            {order.waiterName} · {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <ul className="divide-y divide-border">
          {order.items.map((line) => (
            <li
              key={`${line.menuItemId}-${line.name}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <span>
                {line.quantity}× {line.name}
              </span>
              <span className="font-medium tabular-nums">
                {formatMoney(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-semibold tabular-nums text-primary">
            {formatMoney(order.subtotal)}
          </span>
        </div>
      </div>

      {order.notes ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Notes: </span>
          {order.notes}
        </p>
      ) : null}

      {!isClosed ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {nextStatus ? (
            <form action={statusAction}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={nextStatus} />
              <Button type="submit" size="sm" disabled={statusPending}>
                {statusPending ? <Loader2 className="animate-spin" /> : null}
                {NEXT_LABEL[order.status] ?? `Mark as ${nextStatus}`}
              </Button>
            </form>
          ) : null}
          <form action={cancelAction}>
            <input type="hidden" name="id" value={order.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={cancelPending}
            >
              {cancelPending ? <Loader2 className="animate-spin" /> : null}
              Cancel order
            </Button>
          </form>
        </div>
      ) : null}

      {(statusState.message || cancelState.message) && (
        <p
          className={
            statusState.ok || cancelState.ok
              ? "text-sm text-primary"
              : "text-sm text-destructive"
          }
        >
          {statusState.message || cancelState.message}
        </p>
      )}
    </div>
  );
}
