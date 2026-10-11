import { Suspense } from "react";

import {
  AdminAppLayout,
  AdminAppLayoutFallback,
} from "@/components/admin/admin-app-layout";
import { RoleGate } from "@/components/auth/role-gate";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminAppLayoutFallback>{children}</AdminAppLayoutFallback>}>
      <RoleGate role="admin">
        <AdminAppLayout>{children}</AdminAppLayout>
      </RoleGate>
    </Suspense>
  );
}
