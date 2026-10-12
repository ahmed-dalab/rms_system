import {
  jsonData,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin, requireApiUser } from "@/server/api/guards";
import {
  createTable,
  listActiveTables,
  listTables,
} from "@/server/db/repositories/table.repository";
import { tableFormSchema } from "@/validations/table.schema";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const activeOnly =
      user.role === "waiter" || searchParams.get("activeOnly") === "true";

    const tables = activeOnly ? await listActiveTables() : await listTables();
    return jsonData(tables);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const body = await parseJson(request, tableFormSchema);
    const table = await createTable({
      label: body.label,
      capacity: body.capacity,
      isActive: body.isActive,
    });
    return jsonData(table, { status: 201 });
  });
}
