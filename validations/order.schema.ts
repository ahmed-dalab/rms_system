import { z } from "zod";

import { ORDER_STATUSES } from "@/types/order";

export const orderLineItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  tableId: z.string().min(1, "Select a table"),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  items: z
    .array(orderLineItemSchema)
    .min(1, "Add at least one item to the order"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderIdSchema = z.object({
  id: z.string().min(1),
});

export const updateOrderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});
