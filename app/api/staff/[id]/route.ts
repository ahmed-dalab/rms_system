import { ApiError } from "@/server/api/api-error";
import {
  jsonMessage,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import { findUserById } from "@/server/db/repositories/user.repository";
import {
  deleteWaiterRecord,
  updateWaiterRecord,
} from "@/server/services/staff.service";
import { updateWaiterSchema, waiterIdSchema } from "@/validations/staff.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = waiterIdSchema.parse({ id: (await context.params).id });
    const body = await parseJson(
      request,
      updateWaiterSchema.omit({ id: true }),
    );
    await updateWaiterRecord({ ...body, id });
    return jsonMessage("Waiter updated");
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const admin = await requireApiAdmin();
    const { id } = waiterIdSchema.parse({ id: (await context.params).id });

    const user = await findUserById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await deleteWaiterRecord(id, admin.id);
    return jsonMessage("Waiter removed");
  });
}
