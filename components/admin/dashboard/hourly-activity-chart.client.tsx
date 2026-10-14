"use client";

import { formatHourLabel } from "@/lib/format/datetime";
import type { HourlyOrderStat } from "@/types/report";

type HourlyActivityChartProps = {
  data: HourlyOrderStat[];
};

export function HourlyActivityChart({ data }: HourlyActivityChartProps) {
  const nowHour = new Date().getHours();
  const visible = data.filter((d) => d.hour <= nowHour);

  if (visible.every((d) => d.orderCount === 0)) {
    return (
      <p className="text-sm text-muted-foreground">
        No orders recorded yet today.
      </p>
    );
  }

  const maxCount = Math.max(...visible.map((d) => d.orderCount), 1);

  return (
    <div className="flex h-36 items-end gap-0.5 border-b border-border pb-2">
      {visible.map((slot) => {
        const height = Math.round((slot.orderCount / maxCount) * 100);
        const isPeak = slot.orderCount === maxCount && slot.orderCount > 0;
        return (
          <div
            key={slot.hour}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
            title={`${formatHourLabel(slot.hour)}: ${slot.orderCount} orders`}
          >
            <div className="flex w-full flex-1 flex-col justify-end">
              <div
                className={`w-full rounded-t-sm transition-all ${isPeak ? "bg-primary" : "bg-primary/50"}`}
                style={{
                  height: `${Math.max(height, slot.orderCount > 0 ? 10 : 2)}%`,
                }}
              />
            </div>
            {slot.hour % 3 === 0 ? (
              <span className="truncate text-[9px] text-muted-foreground">
                {formatHourLabel(slot.hour)}
              </span>
            ) : (
              <span className="h-3" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
