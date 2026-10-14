"use client";

import { ArrowLeft, CheckCircle2, Loader2, StickyNote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusSteps } from "@/components/orders/order-status-steps";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import {
  NEXT_ORDER_ACTION_LABEL,
  NEXT_ORDER_STATUS,
  isOrderClosed,
} from "@/lib/constants/order-flow";
import { OrderTotalsSummary } from "@/components/orders/order-totals-summary";
import { formatMoney } from "@/lib/format/currency";
import {
  cancelOrderAction,
  updateOrderStatusAction,
  type OrderActionState,
} from "@/server/actions/order.actions";
import type { OrderRecord } from "@/types/order";

const initialState: OrderActionState = { ok: false, message: "" };

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

  const nextStatus = NEXT_ORDER_STATUS[order.status];
  const closed = isOrderClosed(order.status);
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0);
  const message = statusState.message || cancelState.message;
  const messageOk = statusState.ok || cancelState.ok;

  useEffect(() => {
    if (statusState.ok || cancelState.ok) {
      router.refresh();
    }
  }, [statusState.ok, cancelState.ok, router]);

  return (
    <div className="space-y-4">
      {backHref ? (
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 w-fit">
          <Link href={backHref}>
            <ArrowLeft />
            {backLabel}
          </Link>
        </Button>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Items</h2>
              <span className="text-xs text-muted-foreground">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </header>
            <ul className="divide-y divide-border">
              {order.items.map((line) => (
                <li
                  key={`${line.menuItemId}-${line.name}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground tabular-nums">
                    {line.quantity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatMoney(line.price)} each
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <footer className="border-t border-border bg-muted/40 px-4 py-3">
              <OrderTotalsSummary subtotal={order.subtotal} />
            </footer>
          </section>

          {order.notes ? (
            <section className="flex gap-3 rounded-lg border border-border bg-accent/50 px-4 py-3">
              <StickyNote className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                  Notes
                </p>
                <p className="mt-1 text-sm">{order.notes}</p>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm lg:sticky lg:top-20">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Table
              </p>
              <p className="text-2xl font-bold leading-tight">
                {order.tableLabel}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <dl className="grid grid-cols-2 gap-3 border-y border-border py-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Waiter</dt>
              <dd className="truncate font-medium">{order.waiterName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Placed</dt>
              <dd className="font-medium" suppressHydrationWarning>
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          </dl>

          <OrderStatusSteps status={order.status} />

          {!closed ? (
            <div className="space-y-2 border-t border-border pt-4">
              {nextStatus ? (
                <form action={statusAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value={nextStatus} />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={statusPending || cancelPending}
                  >
                    {statusPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CheckCircle2 />
                    )}
                    {NEXT_ORDER_ACTION_LABEL[order.status]}
                  </Button>
                </form>
              ) : null}
              <form action={cancelAction}>
                <input type="hidden" name="id" value={order.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={statusPending || cancelPending}
                >
                  {cancelPending ? <Loader2 className="animate-spin" /> : null}
                  Cancel order
                </Button>
              </form>
            </div>
          ) : null}

          {message ? (
            <ActionMessage
              message={message}
              ok={messageOk}
              size="sm"
              className="text-center"
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
