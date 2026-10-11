import {
  AppSidebarFrame,
  AppSidebarFrameFallback,
} from "@/components/layout/app-sidebar-frame";
import { WaiterNav } from "@/components/waiter/waiter-nav.client";

export function WaiterSidebar() {
  return <AppSidebarFrame subtitle="Waiter floor" nav={<WaiterNav />} />;
}

export function WaiterSidebarFallback() {
  return <AppSidebarFrameFallback />;
}
