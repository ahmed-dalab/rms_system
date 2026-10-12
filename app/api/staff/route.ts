import {
  jsonData,
  jsonMessage,
  parseJson,
  withApiHandler,
} from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import { listStaffMembers } from "@/server/db/repositories/user.repository";
import { createWaiterRecord } from "@/server/services/staff.service";
import { createWaiterSchema } from "@/validations/staff.schema";

export async function GET() {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const staff = await listStaffMembers();
    return jsonData(staff);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const body = await parseJson(request, createWaiterSchema);
    await createWaiterRecord(body);
    return jsonMessage("Waiter account created", { status: 201 });
  });
}
