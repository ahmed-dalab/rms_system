import { ApiError } from "@/server/api/api-error";
import {
  jsonData,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin, requireApiUser } from "@/server/api/guards";
import {
  categoryExists,
  createMenuItem,
  listAvailableMenuItems,
  listMenuItems,
} from "@/server/db/repositories/menu-item.repository";
import { menuItemFormSchema } from "@/validations/menu-item.schema";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const availableOnly =
      user.role === "waiter" ||
      searchParams.get("availableOnly") === "true";

    const items = availableOnly
      ? await listAvailableMenuItems()
      : await listMenuItems();
    return jsonData(items);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const body = await parseJson(request, menuItemFormSchema);

    const exists = await categoryExists(body.categoryId);
    if (!exists) {
      throw new ApiError(400, "Selected category does not exist");
    }

    const item = await createMenuItem({
      name: body.name,
      description: body.description?.trim() || null,
      price: body.price,
      categoryId: body.categoryId,
      sortOrder: body.sortOrder,
      isAvailable: body.isAvailable,
      imageUrl: body.imageUrl?.trim() ? body.imageUrl.trim() : null,
    });
    return jsonData(item, { status: 201 });
  });
}
