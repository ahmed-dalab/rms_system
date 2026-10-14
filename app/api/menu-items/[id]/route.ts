import { ApiError } from "@/server/api/api-error";
import {
  jsonData,
  jsonMessage,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import { enrichMenuItemRecord } from "@/lib/menu-item-images";
import {
  categoryExists,
  deleteMenuItem,
  findMenuItemById,
  updateMenuItem,
} from "@/server/db/repositories/menu-item.repository";
import {
  menuItemFormSchema,
  menuItemIdSchema,
} from "@/validations/menu-item.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = menuItemIdSchema.parse({ id: (await context.params).id });
    const item = await findMenuItemById(id);
    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }
    return jsonData(
      await enrichMenuItemRecord(item, { includeStorageKey: true }),
    );
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = menuItemIdSchema.parse({ id: (await context.params).id });
    const body = await parseJson(request, menuItemFormSchema.partial());

    if (body.categoryId) {
      const exists = await categoryExists(body.categoryId);
      if (!exists) {
        throw new ApiError(400, "Selected category does not exist");
      }
    }

    const item = await updateMenuItem(id, {
      ...body,
      description:
        body.description !== undefined
          ? body.description?.trim() || null
          : undefined,
      imageUrl:
        body.imageUrl !== undefined
          ? body.imageUrl?.trim()
            ? body.imageUrl.trim()
            : null
          : undefined,
    });
    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }
    return jsonData(
      await enrichMenuItemRecord(item, { includeStorageKey: true }),
    );
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const { id } = menuItemIdSchema.parse({ id: (await context.params).id });
    const deleted = await deleteMenuItem(id);
    if (!deleted) {
      throw new ApiError(404, "Menu item not found");
    }
    return jsonMessage("Menu item deleted");
  });
}
