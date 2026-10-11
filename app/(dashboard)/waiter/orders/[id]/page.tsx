import { Suspense } from "react";

import { OrderDetailContent } from "@/components/waiter/order-detail-content";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WaiterOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <OrderDetailContent orderId={id} />
    </Suspense>
  );
}
