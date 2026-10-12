import { ApiError } from "@/server/api/api-error";
import {
  jsonData,
  jsonMessage,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import {
  deleteCategory,
  findCategoryById,
} from "@/server/db/repositories/category.repository";
import { updateCategoryRecord } from "@/server/services/category.service";
import { categoryFormSchema, categoryIdSchema } from "@/validations/category.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = categoryIdSchema.parse({ id: (await context.params).id });
    const category = await findCategoryById(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return jsonData(category);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = categoryIdSchema.parse({ id: (await context.params).id });
    const body = await parseJson(request, categoryFormSchema);
    const category = await updateCategoryRecord(id, body);
    return jsonData(category);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = categoryIdSchema.parse({ id: (await context.params).id });
    const deleted = await deleteCategory(id);
    if (!deleted) {
      throw new ApiError(404, "Category not found");
    }
    return jsonMessage("Category deleted");
  });
}
