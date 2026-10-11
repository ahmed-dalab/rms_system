"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PageToolbar } from "@/components/layout/page-toolbar";
import { Button } from "@/components/ui/button";
import { REPORT_RANGES, type ReportRange } from "@/types/report";

const labels: Record<ReportRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  all: "All time",
};

export function ReportRangePicker({ current }: { current: ReportRange }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setRange(range: ReportRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`/admin/reports?${params.toString()}`);
  }

  return (
    <PageToolbar>
      <p className="text-sm text-muted-foreground">Period</p>
      <div className="flex flex-wrap gap-1.5">
        {REPORT_RANGES.map((range) => (
          <Button
            key={range}
            type="button"
            size="sm"
            variant={current === range ? "default" : "outline"}
            onClick={() => setRange(range)}
          >
            {labels[range]}
          </Button>
        ))}
      </div>
    </PageToolbar>
  );
}
