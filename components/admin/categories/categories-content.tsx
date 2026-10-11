import dynamic from "next/dynamic";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listCategories } from "@/server/db/repositories/category.repository";

const CategoryManager = dynamic(
  () =>
    import("@/components/admin/categories/category-manager.client").then(
      (mod) => mod.CategoryManager,
    ),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
  },
);

export async function CategoriesContent() {
  const categories = await listCategories();

  return (
    <AdminPageShell
      title="Categories"
      description="Organize the menu into sections for the POS and reports."
    >
      <CategoryManager categories={categories} />
    </AdminPageShell>
  );
}
