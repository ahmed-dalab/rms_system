"use server";

import { revalidatePath } from "next/cache";

import { authenticated } from "@/server/auth/authenticated";
import {
  createOrder,
  findOrderById,
  updateOrderStatus,
} from "@/server/db/repositories/order.repository";
import { findMenuItemsByIds } from "@/server/db/repositories/menu-item.repository";
import { findTableById } from "@/server/db/repositories/table.repository";
import type { OrderLineItemRecord, OrderStatus } from "@/types/order";
import type { UserRole } from "@/types/roles";
import {
  createOrderSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from "@/validations/order.schema";

const WAITER_ORDERS_PATH = "/waiter/orders";
const WAITER_POS_PATH = "/waiter/pos";
const ADMIN_ORDERS_PATH = "/admin/orders";

async function assertWaiter() {
  const user = await authenticated();
  if (user.role !== "waiter") {
    throw new Error("Unauthorized");
  }
  return user;
}

async function assertOrderManager() {
  const user = await authenticated();
  const allowed: UserRole[] = ["waiter", "admin"];
  if (!allowed.includes(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath(WAITER_ORDERS_PATH);
  revalidatePath(WAITER_POS_PATH);
  revalidatePath(ADMIN_ORDERS_PATH);
  revalidatePath(`/waiter/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/waiter");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
}

export type OrderActionState = {
  ok: boolean;
  message: string;
  orderId?: string;
};

export async function createOrderAction(
  _prev: OrderActionState | undefined,
  formData: FormData,
): Promise<OrderActionState> {
  try {
    const user = await assertWaiter();

    const itemsRaw = formData.get("items");
    let itemsJson: unknown = [];
    if (typeof itemsRaw === "string" && itemsRaw.trim()) {
      itemsJson = JSON.parse(itemsRaw);
    }

    const parsed = createOrderSchema.safeParse({
      tableId: formData.get("tableId"),
      notes: formData.get("notes") ?? "",
      items: itemsJson,
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid order",
      };
    }

    const table = await findTableById(parsed.data.tableId);
    if (!table || !table.isActive) {
      return { ok: false, message: "Table is not available" };
    }

    const menuItemIds = parsed.data.items.map((i) => i.menuItemId);
    const menuItems = await findMenuItemsByIds(menuItemIds);
    if (menuItems.length !== new Set(menuItemIds).size) {
      return { ok: false, message: "One or more menu items are unavailable" };
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    const lines: OrderLineItemRecord[] = [];
    let subtotal = 0;

    for (const line of parsed.data.items) {
      const menuItem = menuMap.get(line.menuItemId);
      if (!menuItem) {
        return { ok: false, message: "Invalid menu item in order" };
      }
      lines.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: line.quantity,
      });
      subtotal += menuItem.price * line.quantity;
    }

    const order = await createOrder({
      tableId: parsed.data.tableId,
      waiterId: user.id,
      items: lines,
      subtotal,
      notes: parsed.data.notes?.trim() || null,
    });

    revalidateOrderPaths(order.id);

    return {
      ok: true,
      message: "Order placed",
      orderId: order.id,
    };
  } catch {
    return { ok: false, message: "Failed to create order" };
  }
}

export async function updateOrderStatusAction(
  _prev: OrderActionState | undefined,
  formData: FormData,
): Promise<OrderActionState> {
  try {
    await assertOrderManager();

    const parsed = updateOrderStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid request",
      };
    }

    const existing = await findOrderById(parsed.data.id);
    if (!existing) {
      return { ok: false, message: "Order not found" };
    }

    await updateOrderStatus(parsed.data.id, parsed.data.status as OrderStatus);

    revalidateOrderPaths(parsed.data.id);

    return { ok: true, message: "Order updated" };
  } catch {
    return { ok: false, message: "Failed to update order" };
  }
}

export async function cancelOrderAction(
  _prev: OrderActionState | undefined,
  formData: FormData,
): Promise<OrderActionState> {
  const idResult = orderIdSchema.safeParse({ id: formData.get("id") });
  if (!idResult.success) {
    return { ok: false, message: "Invalid order" };
  }

  const fd = new FormData();
  fd.set("id", idResult.data.id);
  fd.set("status", "cancelled");
  return updateOrderStatusAction(undefined, fd);
}
