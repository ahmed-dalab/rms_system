import mongoose from "mongoose";

import {
  OrderModel,
  type OrderDocument,
} from "@/server/db/models/order.model";
import { TableModel } from "@/server/db/models/table.model";
import { UserModel } from "@/server/db/models/user.model";
import { withDb } from "@/server/db/with-db";
import type {
  OrderLineItemRecord,
  OrderRecord,
  OrderStatus,
} from "@/types/order";

type PopulatedOrder = OrderDocument & {
  tableId: { _id: mongoose.Types.ObjectId; label: string } | null;
  waiterId: { _id: mongoose.Types.ObjectId; displayName?: string; email: string } | null;
};

function toOrderRecord(doc: PopulatedOrder): OrderRecord {
  const table =
    doc.tableId && typeof doc.tableId === "object" ? doc.tableId : null;
  const waiter =
    doc.waiterId && typeof doc.waiterId === "object" ? doc.waiterId : null;

  const items: OrderLineItemRecord[] = doc.items.map((line) => ({
    menuItemId: line.menuItemId.toString(),
    name: line.name,
    price: line.price,
    quantity: line.quantity,
  }));

  return {
    id: doc._id.toString(),
    tableId: table?._id.toString() ?? String(doc.tableId),
    tableLabel: table?.label ?? "Unknown",
    waiterId: waiter?._id.toString() ?? String(doc.waiterId),
    waiterName: waiter?.displayName ?? waiter?.email ?? "Waiter",
    status: doc.status as OrderStatus,
    items,
    subtotal: doc.subtotal,
    notes: doc.notes ?? null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

const populateConfig = [
  { path: "tableId", select: "label", model: TableModel },
  {
    path: "waiterId",
    select: "displayName email",
    model: UserModel,
  },
];

export async function listOrders(options?: {
  activeOnly?: boolean;
}): Promise<OrderRecord[]> {
  return withDb(async () => {
    const filter =
      options?.activeOnly === true
        ? { status: { $nin: ["paid", "cancelled"] as OrderStatus[] } }
        : {};

    const docs = await OrderModel.find(filter)
      .populate(populateConfig)
      .sort({ createdAt: -1 })
      .lean<PopulatedOrder[]>();

    return docs.map(toOrderRecord);
  });
}

export async function findOrderById(id: string): Promise<OrderRecord | null> {
  return withDb(async () => {
    const doc = await OrderModel.findById(id)
      .populate(populateConfig)
      .lean<PopulatedOrder>();
    return doc ? toOrderRecord(doc) : null;
  });
}

export async function createOrder(input: {
  tableId: string;
  waiterId: string;
  items: OrderLineItemRecord[];
  subtotal: number;
  notes: string | null;
}): Promise<OrderRecord> {
  return withDb(async () => {
    const doc = await OrderModel.create({
      tableId: input.tableId,
      waiterId: input.waiterId,
      status: "pending",
      items: input.items.map((line) => ({
        menuItemId: line.menuItemId,
        name: line.name,
        price: line.price,
        quantity: line.quantity,
      })),
      subtotal: input.subtotal,
      notes: input.notes,
    });

    const populated = await OrderModel.findById(doc._id)
      .populate(populateConfig)
      .lean<PopulatedOrder>();

    if (!populated) {
      throw new Error("Failed to load created order");
    }
    return toOrderRecord(populated);
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderRecord | null> {
  return withDb(async () => {
    await OrderModel.findByIdAndUpdate(id, { $set: { status } });
    const doc = await OrderModel.findById(id)
      .populate(populateConfig)
      .lean<PopulatedOrder>();
    return doc ? toOrderRecord(doc) : null;
  });
}

export async function countActiveOrders(): Promise<number> {
  return withDb(() =>
    OrderModel.countDocuments({
      status: { $nin: ["paid", "cancelled"] },
    }),
  );
}
