import { ApiError } from "@/server/api/api-error";
import {
  jsonData,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiOrderManager } from "@/server/api/guards";
import { findOrderById } from "@/server/db/repositories/order.repository";
import { updateOrderStatusRecord } from "@/server/services/order.service";
import { orderIdSchema, updateOrderStatusSchema } from "@/validations/order.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiOrderManager();
    const { id } = orderIdSchema.parse({ id: (await context.params).id });
    const order = await findOrderById(id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    return jsonData(order);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiOrderManager();
    const { id } = orderIdSchema.parse({ id: (await context.params).id });
    const body = await parseJson(
      request,
      updateOrderStatusSchema.omit({ id: true }),
    );
    const order = await updateOrderStatusRecord(id, body.status);
    return jsonData(order);
  });
}
