import dynamic from "next/dynamic";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/layout/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { KpiStat } from "@/components/layout/kpi-stat";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format/currency";
import type { ReportSummary } from "@/types/report";
import type { OrderStatus } from "@/types/order";

const RevenueChart = dynamic(
  () =>
    import("@/components/admin/reports/revenue-chart.client").then(
      (mod) => mod.RevenueChart,
    ),
  { loading: () => <Skeleton className="h-40 w-full" /> },
);

export function ReportsDashboard({ summary }: { summary: ReportSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStat
          label="Paid revenue"
          value={formatMoney(summary.paidRevenue)}
          hint={`${summary.paidOrders} paid orders`}
        />
        <KpiStat
          label="Avg. ticket"
          value={formatMoney(summary.averagePaidTicket)}
          hint="Paid orders only"
        />
        <KpiStat
          label="Total orders"
          value={String(summary.totalOrders)}
          hint={`${summary.cancelledOrders} cancelled`}
        />
        <KpiStat
          label="Active now"
          value={String(summary.activeOrders)}
          hint="Open on the floor"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Revenue trend
          </h2>
          <div className="rounded-md border border-border bg-card p-4">
            <RevenueChart data={summary.dailyRevenue} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Orders by status
          </h2>
          {summary.statusBreakdown.length === 0 ? (
            <EmptyState title="No orders in this period" />
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {summary.statusBreakdown.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <OrderStatusBadge status={row.status as OrderStatus} />
                  <span className="text-sm font-medium tabular-nums">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Top menu items
        </h2>
        {summary.topItems.length === 0 ? (
          <EmptyState title="No sales data for this period" />
        ) : (
          <DataTable>
            <DataTableHead>
              <DataTableHeaderCell>Item</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Qty</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Revenue</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {summary.topItems.map((item) => (
                <DataTableRow key={item.name}>
                  <DataTableCell className="font-medium">
                    {item.name}
                  </DataTableCell>
                  <DataTableCell align="right">{item.quantitySold}</DataTableCell>
                  <DataTableCell align="right" className="font-medium">
                    {formatMoney(item.revenue)}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </section>
    </div>
  );
}
