import dynamic from "next/dynamic";
import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/layout/data-table";
import { KpiStat } from "@/components/layout/kpi-stat";
import { RecentOrdersPanel } from "@/components/admin/dashboard/recent-orders-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format/currency";
import { countMenuItems } from "@/server/db/repositories/menu-item.repository";
import { listRecentOrders } from "@/server/db/repositories/order.repository";
import {
  getReportSummary,
  getTodayHourlyStats,
} from "@/server/db/repositories/report.repository";
import { listTables } from "@/server/db/repositories/table.repository";
import { listStaffMembers } from "@/server/db/repositories/user.repository";
import { requireRole } from "@/server/auth/guards";
import type { DailyRevenueStat } from "@/types/report";

const RevenueChart = dynamic(
  () =>
    import("@/components/admin/reports/revenue-chart.client").then(
      (mod) => mod.RevenueChart,
    ),
  { loading: () => <Skeleton className="h-48 w-full" /> },
);

const OrdersCountChart = dynamic(
  () =>
    import("@/components/admin/dashboard/orders-count-chart.client").then(
      (mod) => mod.OrdersCountChart,
    ),
  { loading: () => <Skeleton className="h-40 w-full" /> },
);

const StatusBreakdownChart = dynamic(
  () =>
    import("@/components/admin/dashboard/status-breakdown-chart.client").then(
      (mod) => mod.StatusBreakdownChart,
    ),
  { loading: () => <Skeleton className="h-32 w-full" /> },
);

const HourlyActivityChart = dynamic(
  () =>
    import("@/components/admin/dashboard/hourly-activity-chart.client").then(
      (mod) => mod.HourlyActivityChart,
    ),
  { loading: () => <Skeleton className="h-36 w-full" /> },
);

function revenueDayOverDay(daily: DailyRevenueStat[]): string | undefined {
  if (daily.length < 2) {
    return undefined;
  }
  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
  const yesterday = sorted[sorted.length - 2]!;
  const today = sorted[sorted.length - 1]!;
  if (yesterday.revenue === 0 && today.revenue === 0) {
    return "No completed sales yet";
  }
  if (yesterday.revenue === 0) {
    return "First revenue day this week";
  }
  const pct =
    ((today.revenue - yesterday.revenue) / yesterday.revenue) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}% vs yesterday`;
}

export async function AdminDashboardContent() {
  await requireRole("admin");

  const [today, week, hourly, recentOrders, menuItemCount, tables, staff] =
    await Promise.all([
      getReportSummary("today"),
      getReportSummary("7d"),
      getTodayHourlyStats(),
      listRecentOrders(8),
      countMenuItems(),
      listTables(),
      listStaffMembers(),
    ]);

  const dayHint = revenueDayOverDay(week.dailyRevenue);
  const openTablesEstimate = Math.min(today.activeOrders, tables.length);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Today</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reports">Full reports</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiStat
            label="Revenue today"
            value={formatMoney(today.paidRevenue)}
            hint={
              dayHint ??
              `${today.paidOrders} completed · ${today.totalOrders} total`
            }
            href="/admin/reports"
            hrefLabel="Reports"
          />
          <KpiStat
            label="Avg. ticket today"
            value={formatMoney(today.averagePaidTicket)}
            hint="Completed orders only"
          />
          <KpiStat
            label="Open orders"
            value={String(today.activeOrders)}
            hint={
              openTablesEstimate > 0
                ? `~${openTablesEstimate} table${openTablesEstimate === 1 ? "" : "s"} in service`
                : "Nothing pending on the floor"
            }
            href="/admin/orders"
            hrefLabel="View orders"
          />
          <KpiStat
            label="Completed today"
            value={String(today.paidOrders)}
            hint={`${today.cancelledOrders} cancelled`}
            href="/admin/orders?filter=all"
            hrefLabel="Order history"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">
            Last 7 days — revenue
          </h2>
          <div className="rounded-md border border-border bg-card p-4">
            <RevenueChart data={week.dailyRevenue} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Today by hour
          </h2>
          <div className="rounded-md border border-border bg-card p-4">
            <HourlyActivityChart data={hourly} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Last 7 days — order volume
          </h2>
          <div className="rounded-md border border-border bg-card p-4">
            <OrdersCountChart data={week.dailyRevenue} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Today — order status
          </h2>
          <div className="rounded-md border border-border bg-card p-4">
            <StatusBreakdownChart rows={today.statusBreakdown} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Top sellers today
            </h2>
            <Link
              href="/admin/menu"
              className="text-xs font-medium text-primary hover:underline"
            >
              Menu
            </Link>
          </div>
          {today.topItems.length === 0 ? (
            <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
              No completed sales yet today.
            </p>
          ) : (
            <DataTable>
              <DataTableHead>
                <DataTableHeaderCell>Item</DataTableHeaderCell>
                <DataTableHeaderCell align="right">Qty</DataTableHeaderCell>
                <DataTableHeaderCell align="right">Revenue</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {today.topItems.slice(0, 6).map((item) => (
                  <DataTableRow key={item.name}>
                    <DataTableCell className="font-medium">
                      {item.name}
                    </DataTableCell>
                    <DataTableCell align="right">
                      {item.quantitySold}
                    </DataTableCell>
                    <DataTableCell align="right" className="font-medium">
                      {formatMoney(item.revenue)}
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Recent activity
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              All orders
            </Link>
          </div>
          <div className="rounded-md border border-border bg-card px-3">
            <RecentOrdersPanel orders={recentOrders} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Setup</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiStat
            label="7-day revenue"
            value={formatMoney(week.paidRevenue)}
            hint={`${week.paidOrders} completed orders`}
            href="/admin/reports"
            hrefLabel="Reports"
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
          <KpiStat
            label="Staff"
            value={String(staff.length)}
            hint="Waiters with portal access"
            href="/admin/staff"
            hrefLabel="Staff"
          />
        </div>
      </section>
    </div>
  );
}
