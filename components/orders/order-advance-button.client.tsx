"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import {
  NEXT_ORDER_ACTION_LABEL,
  NEXT_ORDER_STATUS,
} from "@/lib/constants/order-flow";
import { cn } from "@/lib/utils";
import {
  updateOrderStatusAction,
  type OrderActionState,
} from "@/server/actions/order.actions";
import type { OrderStatus } from "@/types/order";

const initialState: OrderActionState = { ok: false, message: "" };

type OrderAdvanceButtonProps = {
  orderId: string;
  status: OrderStatus;
  className?: string;
};

export function OrderAdvanceButton({
  orderId,
  status,
  className,
}: OrderAdvanceButtonProps) {
  const [state, action, pending] = useActionState(
    updateOrderStatusAction,
    initialState,
  );
  const next = NEXT_ORDER_STATUS[status];

  if (!next) {
    return null;
  }

  return (
    <form action={action} className={cn("flex flex-col items-end", className)}>
      <input type="hidden" name="id" value={orderId} />
      <input type="hidden" name="status" value={next} />
      <Button
        type="submit"
        size="sm"
        className="h-8 px-3 text-xs"
        disabled={pending}
      >
        {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        {NEXT_ORDER_ACTION_LABEL[status]}
      </Button>
      {state.message ? (
        <ActionMessage
          message={state.message}
          ok={state.ok}
          className="mt-1 text-[11px]"
        />
      ) : null}
    </form>
  );
}
