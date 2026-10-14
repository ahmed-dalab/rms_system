import dynamic from "next/dynamic";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { enrichMenuItemRecords } from "@/lib/menu-item-images";
import { requireRole } from "@/server/auth/guards";
import { listCategories } from "@/server/db/repositories/category.repository";
import { listMenuItems } from "@/server/db/repositories/menu-item.repository";

const MenuItemManager = dynamic(
  () =>
    import("@/components/admin/menu/menu-item-manager.client").then(
      (mod) => mod.MenuItemManager,
    ),
  { loading: () => <Skeleton className="h-48 w-full" /> },
);

export async function MenuItemsContent() {
  await requireRole("admin");
  const [rawItems, categories] = await Promise.all([
    listMenuItems(),
    listCategories(),
  ]);
  const items = await enrichMenuItemRecords(rawItems, {
    includeStorageKey: true,
  });

  return (
    <AdminPageShell
      title="Menu items"
      description="Dishes and prices linked to categories for the POS."
    >
      <MenuItemManager items={items} categories={categories} />
    </AdminPageShell>
  );
}
