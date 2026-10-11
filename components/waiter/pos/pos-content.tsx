import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { listAvailableMenuItems } from "@/server/db/repositories/menu-item.repository";
import { listActiveTables } from "@/server/db/repositories/table.repository";

const PosTerminal = dynamic(
  () =>
    import("@/components/waiter/pos/pos-terminal.client").then(
      (mod) => mod.PosTerminal,
    ),
  {
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-8">
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    ),
  },
);

export async function PosContent() {
  const [tables, menuItems] = await Promise.all([
    listActiveTables(),
    listAvailableMenuItems(),
  ]);

  return <PosTerminal tables={tables} menuItems={menuItems} />;
}
