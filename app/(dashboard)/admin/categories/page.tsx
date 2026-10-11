import { Suspense } from "react";

import { CategoriesContent } from "@/components/admin/categories/categories-content";
import { CategoriesPageSkeleton } from "@/components/admin/categories/categories-skeleton";

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<CategoriesPageSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}
