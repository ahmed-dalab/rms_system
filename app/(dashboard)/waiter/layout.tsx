import { Suspense } from "react";

import { RoleGateClient } from "@/components/auth/role-gate.client";
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
    <RoleGateClient role="waiter">
      <Suspense fallback={<WaiterAppLayoutFallback>{children}</WaiterAppLayoutFallback>}>
        <WaiterAppLayout>{children}</WaiterAppLayout>
      </Suspense>
    </RoleGateClient>
  );
}
