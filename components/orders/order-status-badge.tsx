import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  served: "Served",
  paid: "Paid",
  cancelled: "Cancelled",
};

const variants: Record<
  OrderStatus,
  "default" | "secondary" | "muted" | "outline"
> = {
  pending: "secondary",
  preparing: "default",
  served: "outline",
  paid: "muted",
  cancelled: "muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
