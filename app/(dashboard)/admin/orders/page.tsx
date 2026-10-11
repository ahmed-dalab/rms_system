import { Suspense } from "react";

import { AdminOrdersContent } from "@/components/admin/orders/admin-orders-content";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;

  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdminOrdersContent filterParam={filter} />
    </Suspense>
  );
}
