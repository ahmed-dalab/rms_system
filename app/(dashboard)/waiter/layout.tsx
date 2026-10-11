import { Suspense } from "react";

import { RoleGate } from "@/components/auth/role-gate";
import {
  WaiterAppLayout,
  WaiterAppLayoutFallback,
} from "@/components/waiter/waiter-app-layout";

export default function WaiterSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate role="waiter">
      <Suspense fallback={<WaiterAppLayoutFallback>{children}</WaiterAppLayoutFallback>}>
        <WaiterAppLayout>{children}</WaiterAppLayout>
      </Suspense>
    </RoleGate>
  );
}
