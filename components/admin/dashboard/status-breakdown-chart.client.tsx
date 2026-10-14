"use client";

import { ORDER_STATUS_LABEL } from "@/lib/constants/order-flow";
import type { StatusCount } from "@/types/report";
import type { OrderStatus } from "@/types/order";

const BAR_COLORS: Partial<Record<OrderStatus, string>> = {
  pending: "bg-primary",
  preparing: "bg-primary/80",
  served: "bg-primary/60",
  paid: "bg-emerald-600",
  cancelled: "bg-muted-foreground/40",
};

type StatusBreakdownChartProps = {
  rows: StatusCount[];
};

export function StatusBreakdownChart({ rows }: StatusBreakdownChartProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No orders yet today.</p>
    );
  }

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const sorted = [...rows].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      {sorted.map((row) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const status = row.status as OrderStatus;
        return (
          <div key={row.status} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {ORDER_STATUS_LABEL[status]}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {row.count} · {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${BAR_COLORS[status] ?? "bg-primary"}`}
                style={{ width: `${Math.max(pct, row.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
