import type { OrderStatus } from "@/types/order";

/** Waiter flow: take order (pending) → customer pays (completed, stored as "paid") */
export const ORDER_FLOW: OrderStatus[] = ["pending", "paid"];

/** "preparing" / "served" are legacy statuses treated as still open */
export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "paid",
  preparing: "paid",
  served: "paid",
};

export const NEXT_ORDER_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Complete order",
  preparing: "Complete order",
  served: "Complete order",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Pending",
  served: "Pending",
  paid: "Completed",
  cancelled: "Cancelled",
};

export function isOrderClosed(status: OrderStatus): boolean {
  return status === "paid" || status === "cancelled";
}
