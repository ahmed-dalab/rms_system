import { Suspense } from "react";

import { TablesContent } from "@/components/admin/tables/tables-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTablesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <TablesContent />
    </Suspense>
  );
}
