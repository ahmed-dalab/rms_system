import dynamic from "next/dynamic";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listTables } from "@/server/db/repositories/table.repository";

const TableManager = dynamic(
  () =>
    import("@/components/admin/tables/table-manager.client").then(
      (mod) => mod.TableManager,
    ),
  { loading: () => <Skeleton className="h-48 w-full" /> },
);

export async function TablesContent() {
  const tables = await listTables();

  return (
    <AdminPageShell
      title="Tables"
      description="Dining tables waiters select when sending orders from the POS."
    >
      <TableManager tables={tables} />
    </AdminPageShell>
  );
}
