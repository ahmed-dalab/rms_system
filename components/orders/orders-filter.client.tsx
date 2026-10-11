"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { PageToolbar } from "@/components/layout/page-toolbar";
import { Button } from "@/components/ui/button";

type OrdersFilterProps = {
  showPosLink?: boolean;
};

export function OrdersFilter({ showPosLink }: OrdersFilterProps) {
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

  return (
    <PageToolbar>
      <div className="flex gap-1.5">
        <Button
          asChild
          size="sm"
          variant={current === "active" ? "default" : "outline"}
        >
          <Link href={hrefFor("active")}>Active</Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant={current === "all" ? "default" : "outline"}
        >
          <Link href={hrefFor("all")}>All</Link>
        </Button>
      </div>
      {showPosLink ? (
        <Button asChild size="sm">
          <Link href="/waiter/pos">Open POS</Link>
        </Button>
      ) : null}
    </PageToolbar>
  );
}
