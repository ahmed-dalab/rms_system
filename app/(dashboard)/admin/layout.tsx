import { Suspense } from "react";

import {
  AdminAppLayout,
  AdminAppLayoutFallback,
} from "@/components/admin/admin-app-layout";
import { RoleGateClient } from "@/components/auth/role-gate.client";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminAppLayoutFallback>{children}</AdminAppLayoutFallback>}>
      <RoleGateClient role="admin">
        <AdminAppLayout>{children}</AdminAppLayout>
      </RoleGateClient>
    </Suspense>
  );
}
