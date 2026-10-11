export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "served",
  "paid",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLineItemRecord = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  tableId: string;
  tableLabel: string;
  waiterId: string;
  waiterName: string;
  status: OrderStatus;
  items: OrderLineItemRecord[];
  subtotal: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
