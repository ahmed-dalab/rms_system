import { ApiError } from "@/server/api/api-error";
import { findMenuItemsByIds } from "@/server/db/repositories/menu-item.repository";
import {
  createOrder,
  findOrderById,
  updateOrderStatus,
} from "@/server/db/repositories/order.repository";
import { findTableById } from "@/server/db/repositories/table.repository";
import type { OrderLineItemRecord, OrderRecord, OrderStatus } from "@/types/order";
import type { CreateOrderInput } from "@/validations/order.schema";

export async function createOrderRecord(
  input: CreateOrderInput,
  waiterId: string,
): Promise<OrderRecord> {
  const table = await findTableById(input.tableId);
  if (!table || !table.isActive) {
    throw new ApiError(400, "Table is not available");
  }

  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await findMenuItemsByIds(menuItemIds);
  if (menuItems.length !== new Set(menuItemIds).size) {
    throw new ApiError(400, "One or more menu items are unavailable");
  }

  const menuMap = new Map(menuItems.map((m) => [m.id, m]));
  const lines: OrderLineItemRecord[] = [];
  let subtotal = 0;

  for (const line of input.items) {
    const menuItem = menuMap.get(line.menuItemId);
    if (!menuItem) {
      throw new ApiError(400, "Invalid menu item in order");
    }
    lines.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: line.quantity,
    });
    subtotal += menuItem.price * line.quantity;
  }

  return createOrder({
    tableId: input.tableId,
    waiterId,
    items: lines,
    subtotal,
    notes: input.notes?.trim() || null,
  });
}

export async function updateOrderStatusRecord(
  id: string,
  status: OrderStatus,
): Promise<OrderRecord> {
  const existing = await findOrderById(id);
  if (!existing) {
    throw new ApiError(404, "Order not found");
  }

  const updated = await updateOrderStatus(id, status);
  if (!updated) {
    throw new ApiError(404, "Order not found");
  }
  return updated;
}
