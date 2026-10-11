import { Suspense } from "react";

import { StaffContent } from "@/components/admin/staff/staff-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStaffPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <StaffContent />
    </Suspense>
  );
}
