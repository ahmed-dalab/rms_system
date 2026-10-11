import { Suspense } from "react";

import { DashboardLayoutInner } from "@/components/dashboard/dashboard-layout-inner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full animate-pulse bg-muted" aria-hidden />
      }
    >
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
