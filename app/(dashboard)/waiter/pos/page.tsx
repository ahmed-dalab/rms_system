import { Suspense } from "react";

import { PosContent } from "@/components/waiter/pos/pos-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function WaiterPosPage() {
  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100svh-3rem)] flex-col md:-mx-6 md:-mt-3 md:min-h-[calc(100svh-3.5rem)]">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-6">
            <Skeleton className="h-48 w-full max-w-lg" />
          </div>
        }
      >
        <PosContent />
      </Suspense>
    </div>
  );
}
