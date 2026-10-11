import { Suspense } from "react";

import { MenuItemsContent } from "@/components/admin/menu/menu-items-content";
import { MenuItemsPageSkeleton } from "@/components/admin/menu/menu-items-skeleton";

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<MenuItemsPageSkeleton />}>
      <MenuItemsContent />
    </Suspense>
  );
}
