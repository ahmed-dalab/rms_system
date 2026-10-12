"use client";

import { Clock } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const TICK_MS = 30_000;
const listeners = new Set<() => void>();
let now = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  now = Date.now();
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function formatElapsed(minutes: number): string {
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

type ElapsedTimeProps = {
  since: string;
  warnAfterMinutes?: number;
  className?: string;
};

export function ElapsedTime({
  since,
  warnAfterMinutes,
  className,
}: ElapsedTimeProps) {
  const current = useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );

  if (current === null) {
    return <span className={cn("h-4 w-12", className)} aria-hidden />;
  }

  const minutes = Math.max(
    0,
    Math.floor((current - new Date(since).getTime()) / 60_000),
  );
  const late = warnAfterMinutes !== undefined && minutes >= warnAfterMinutes;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        late ? "text-destructive" : "text-muted-foreground",
        className,
      )}
      title={new Date(since).toLocaleString()}
    >
      <Clock className="size-3" />
      {formatElapsed(minutes)}
    </span>
  );
}
