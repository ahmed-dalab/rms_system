import { Check, XCircle } from "lucide-react";

import { ORDER_FLOW, ORDER_STATUS_LABEL, isOrderClosed } from "@/lib/constants/order-flow";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

export function OrderStatusSteps({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive">
        <XCircle className="size-4" />
        This order was cancelled
      </div>
    );
  }

  const completed = isOrderClosed(status);
  const currentIndex = completed ? ORDER_FLOW.length : 0;

  return (
    <ol>
      {ORDER_FLOW.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const isLast = index === ORDER_FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5",
                  completed ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                done && "border-primary bg-primary text-primary-foreground",
                current && "border-primary bg-card text-primary",
                !done && !current && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "pt-0.5 text-sm",
                done || current ? "text-foreground" : "text-muted-foreground",
                current && "font-semibold",
              )}
            >
              {ORDER_STATUS_LABEL[step]}
              {current ? (
                <span className="ml-2 text-xs font-normal text-primary">
                  Current
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
