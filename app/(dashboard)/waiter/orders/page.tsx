import { Suspense } from "react";

import { OrdersContent } from "@/components/waiter/orders-content";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function WaiterOrdersPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;

  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <OrdersContent filterParam={filter} />
    </Suspense>
  );
}
