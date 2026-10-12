import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { listAvailableMenuItems } from "@/server/db/repositories/menu-item.repository";
import { listOrders } from "@/server/db/repositories/order.repository";
import { listActiveTables } from "@/server/db/repositories/table.repository";

export function PosSkeleton() {
  return (
    <div className="grid flex-1 gap-px bg-border lg:grid-cols-[13rem_minmax(0,1fr)_22rem]">
      <div className="space-y-2 bg-card p-3">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
      <div className="space-y-3 bg-background p-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
      <div className="hidden bg-card p-4 lg:block">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

const PosTerminal = dynamic(
  () =>
    import("@/components/waiter/pos/pos-terminal.client").then(
      (mod) => mod.PosTerminal,
    ),
  { loading: () => <PosSkeleton /> },
);

export async function PosContent() {
  const [tables, menuItems, activeOrders] = await Promise.all([
    listActiveTables(),
    listAvailableMenuItems(),
    listOrders({ activeOnly: true }),
  ]);

  const busyTableIds = Array.from(
    new Set(activeOrders.map((order) => order.tableId)),
  );

  return (
    <PosTerminal
      tables={tables}
      menuItems={menuItems}
      busyTableIds={busyTableIds}
    />
  );
}
