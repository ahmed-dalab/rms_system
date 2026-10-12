import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL } from "@/lib/constants/order-flow";
import type { OrderStatus } from "@/types/order";

const variants: Record<
  OrderStatus,
  "default" | "secondary" | "muted" | "outline"
> = {
  pending: "default",
  preparing: "default",
  served: "default",
  paid: "secondary",
  cancelled: "muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={variants[status]}>{ORDER_STATUS_LABEL[status]}</Badge>
  );
}
