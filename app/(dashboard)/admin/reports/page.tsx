import { Suspense } from "react";

import { ReportsContent } from "@/components/admin/reports/reports-content";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { range } = await searchParams;

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ReportsContent rangeParam={range} />
    </Suspense>
  );
}
