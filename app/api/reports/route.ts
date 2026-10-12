import { jsonData, withApiHandler } from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import { getReportSummary } from "@/server/db/repositories/report.repository";
import { reportRangeSchema } from "@/validations/report.schema";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    await requireApiAdmin();
    const rangeParam =
      new URL(request.url).searchParams.get("range") ?? "7d";
    const range = reportRangeSchema.parse(rangeParam);
    const summary = await getReportSummary(range);
    return jsonData(summary);
  });
}
