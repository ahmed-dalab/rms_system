import { Suspense } from "react";

import { AdminOrderDetailContent } from "@/components/admin/orders/admin-order-detail-content";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdminOrderDetailContent orderId={id} />
    </Suspense>
  );
}
