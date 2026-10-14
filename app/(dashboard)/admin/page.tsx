import { Suspense } from "react";

import { AdminDashboardContent } from "@/components/admin/dashboard/admin-dashboard-content";
import { AdminDashboardSkeleton } from "@/components/admin/dashboard/admin-dashboard-skeleton";
import { AdminPageShell } from "@/components/admin/admin-page-shell";

export default function AdminDashboardPage() {
  return (
    <AdminPageShell
      title="Dashboard"
      description="Today’s floor activity, trends, and recent orders at a glance."
    >
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </AdminPageShell>
  );
}
