import Link from "next/link";

import { cn } from "@/lib/utils";

type KpiStatProps = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
};

export function KpiStat({
  label,
  value,
  hint,
  href,
  hrefLabel = "View",
  className,
}: KpiStatProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card px-4 py-3",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {href ? (
        <Link
          href={href}
          className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
        >
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}
