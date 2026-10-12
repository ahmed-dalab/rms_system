import { Suspense } from "react";

import { PosContent, PosSkeleton } from "@/components/waiter/pos/pos-content";

export default function WaiterPosPage() {
  return (
    <Suspense fallback={<PosSkeleton />}>
      <PosContent />
    </Suspense>
  );
}
