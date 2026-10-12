"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type OrdersFilterProps = {
  activeLabel?: string;
  allLabel?: string;
};

export function OrdersFilter({
  activeLabel = "Active",
  allLabel = "All",
}: OrdersFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("filter") === "all" ? "all" : "active";

  function hrefFor(filter: "active" | "all") {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "active") {
      params.delete("filter");
    } else {
      params.set("filter", "all");
    }
    const q = params.toString();
    return q ? `${pathname}?${q}` : pathname;
  }

  const options = [
    { value: "active" as const, label: activeLabel },
    { value: "all" as const, label: allLabel },
  ];

  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1"
    >
      {options.map((option) => {
        const selected = current === option.value;
        return (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            role="tab"
            aria-selected={selected}
            className={cn(
              "flex h-8 items-center rounded-md px-3.5 text-sm font-medium transition-colors",
              selected
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
