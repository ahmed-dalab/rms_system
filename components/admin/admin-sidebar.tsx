import { AdminNav } from "@/components/admin/admin-nav.client";
import {
  AppSidebarFrame,
  AppSidebarFrameFallback,
} from "@/components/layout/app-sidebar-frame";

export function AdminSidebar() {
  return <AppSidebarFrame subtitle="Administration" nav={<AdminNav />} />;
}

export function AdminSidebarFallback() {
  return <AppSidebarFrameFallback />;
}
