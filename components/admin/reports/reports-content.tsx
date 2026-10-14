import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { ReportsDashboard } from "@/components/admin/reports/reports-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/server/auth/guards";
import { getReportSummary } from "@/server/db/repositories/report.repository";
import { reportRangeSchema } from "@/validations/report.schema";
import type { ReportRange } from "@/types/report";

const ReportRangePicker = dynamic(
  () =>
    import("@/components/admin/reports/report-range-picker.client").then(
      (mod) => mod.ReportRangePicker,
    ),
  { loading: () => <Skeleton className="h-9 w-48" /> },
);

type ReportsContentProps = {
  rangeParam?: string;
};

export async function ReportsContent({ rangeParam }: ReportsContentProps) {
  await requireRole("admin");
  const parsed = reportRangeSchema.safeParse(rangeParam ?? "7d");
  const range: ReportRange = parsed.success ? parsed.data : "7d";
  const summary = await getReportSummary(range);

  return (
    <AdminPageShell
      title="Reports"
      description="Sales and order analytics for the selected period."
    >
      <Suspense fallback={<Skeleton className="h-9 w-48" />}>
        <ReportRangePicker current={range} />
      </Suspense>
      <ReportsDashboard summary={summary} />
    </AdminPageShell>
  );
}
