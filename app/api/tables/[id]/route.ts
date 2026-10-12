import { ApiError } from "@/server/api/api-error";
import {
  jsonData,
  jsonMessage,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import {
  deleteTable,
  findTableById,
  updateTable,
} from "@/server/db/repositories/table.repository";
import { tableFormSchema, tableIdSchema } from "@/validations/table.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = tableIdSchema.parse({ id: (await context.params).id });
    const table = await findTableById(id);
    if (!table) {
      throw new ApiError(404, "Table not found");
    }
    return jsonData(table);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = tableIdSchema.parse({ id: (await context.params).id });
    const body = await parseJson(request, tableFormSchema.partial());
    const table = await updateTable(id, body);
    if (!table) {
      throw new ApiError(404, "Table not found");
    }
    return jsonData(table);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = tableIdSchema.parse({ id: (await context.params).id });
    const deleted = await deleteTable(id);
    if (!deleted) {
      throw new ApiError(404, "Table not found");
    }
    return jsonMessage("Table deleted");
  });
}
