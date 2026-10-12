import { Suspense } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { KpiStat } from "@/components/layout/kpi-stat";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format/currency";
import { countMenuItems } from "@/server/db/repositories/menu-item.repository";
import { countActiveOrders } from "@/server/db/repositories/order.repository";
import { getReportSummary } from "@/server/db/repositories/report.repository";
import { listTables } from "@/server/db/repositories/table.repository";

async function AdminOverviewStats() {
  const [menuItemCount, tables, activeOrders, weekReport] = await Promise.all([
    countMenuItems(),
    listTables(),
    countActiveOrders(),
    getReportSummary("7d"),
  ]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiStat
        label="7-day revenue"
        value={formatMoney(weekReport.paidRevenue)}
        hint={`${weekReport.paidOrders} completed orders`}
        href="/admin/reports"
        hrefLabel="Reports"
      />
      <KpiStat
        label="Pending orders"
        value={String(activeOrders)}
        hint="Pending orders"
        href="/admin/orders"
        hrefLabel="View orders"
      />
      <KpiStat
        label="Menu items"
        value={String(menuItemCount)}
        href="/admin/menu"
        hrefLabel="Manage menu"
      />
      <KpiStat
        label="Tables"
        value={String(tables.length)}
        href="/admin/tables"
        hrefLabel="Manage tables"
      />
    </div>
  );
}

function AdminOverviewFallback() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton className="h-[5.5rem] w-full" />
      <Skeleton className="h-[5.5rem] w-full" />
      <Skeleton className="h-[5.5rem] w-full" />
      <Skeleton className="h-[5.5rem] w-full" />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminPageShell
      title="Dashboard"
      description="Revenue, floor activity, and setup at a glance."
    >
      <Suspense fallback={<AdminOverviewFallback />}>
        <AdminOverviewStats />
      </Suspense>
    </AdminPageShell>
  );
}
