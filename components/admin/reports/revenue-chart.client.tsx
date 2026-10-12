"use client";

import { formatMoney } from "@/lib/format/currency";
import type { DailyRevenueStat } from "@/types/report";

type RevenueChartProps = {
  data: DailyRevenueStat[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No completed orders in this period.
      </p>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex h-48 items-end gap-2 border-b border-border pb-2">
      {data.map((day) => {
        const height = Math.round((day.revenue / maxRevenue) * 100);
        return (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            title={`${day.date}: ${formatMoney(day.revenue)} (${day.orderCount} orders)`}
          >
            <div className="flex w-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-md bg-primary transition-all"
                style={{ height: `${Math.max(height, day.revenue > 0 ? 8 : 2)}%` }}
              />
            </div>
            <span className="truncate text-[10px] text-muted-foreground">
              {day.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
