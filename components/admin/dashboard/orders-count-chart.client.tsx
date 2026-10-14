"use client";

import type { DailyRevenueStat } from "@/types/report";

type OrdersCountChartProps = {
  data: DailyRevenueStat[];
};

export function OrdersCountChart({ data }: OrdersCountChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No orders in this period.</p>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.orderCount), 1);

  return (
    <div className="flex h-40 items-end gap-2 border-b border-border pb-2">
      {data.map((day) => {
        const height = Math.round((day.orderCount / maxCount) * 100);
        return (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            title={`${day.date}: ${day.orderCount} orders`}
          >
            <div className="flex w-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-md bg-primary/70 transition-all"
                style={{
                  height: `${Math.max(height, day.orderCount > 0 ? 8 : 2)}%`,
                }}
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
