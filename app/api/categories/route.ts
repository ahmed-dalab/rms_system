import {
  jsonData,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import { listCategories } from "@/server/db/repositories/category.repository";
import { createCategoryRecord } from "@/server/services/category.service";
import { categoryFormSchema } from "@/validations/category.schema";

export async function GET() {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const categories = await listCategories();
    return jsonData(categories);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const body = await parseJson(request, categoryFormSchema);
    const category = await createCategoryRecord(body);
    return jsonData(category, { status: 201 });
  });
}
