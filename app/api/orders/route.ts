import {
  jsonData,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import {
  requireApiOrderManager,
  requireApiWaiter,
} from "@/server/api/guards";
import { listOrders } from "@/server/db/repositories/order.repository";
import { createOrderRecord } from "@/server/services/order.service";
import { createOrderSchema } from "@/validations/order.schema";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    await requireApiOrderManager();
    const activeOnly =
      new URL(request.url).searchParams.get("activeOnly") === "true";
    const orders = await listOrders({ activeOnly });
    return jsonData(orders);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const waiter = await requireApiWaiter();
    const body = await parseJson(request, createOrderSchema);
    const order = await createOrderRecord(body, waiter.id);
    return jsonData(order, { status: 201 });
  });
}
