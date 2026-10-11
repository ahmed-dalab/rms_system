import {
  AdminSidebar,
  AdminSidebarFallback,
} from "@/components/admin/admin-sidebar";
import { AppMainColumn } from "@/components/layout/app-main-column";
import {
  DashboardTopbar,
  DashboardTopbarFallback,
} from "@/components/layout/dashboard-topbar";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { APP_MAIN_PADDING_CLASS } from "@/lib/constants/layout";
import { requireUser } from "@/server/auth/guards";

type AdminAppLayoutProps = {
  children: React.ReactNode;
};

export async function AdminAppLayout({ children }: AdminAppLayoutProps) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <div className="min-h-svh w-full bg-background">
        <AdminSidebar />
        <AppMainColumn>
          <DashboardTopbar user={user} portalLabel="Admin" />
          <main className={`flex-1 overflow-y-auto ${APP_MAIN_PADDING_CLASS}`}>
            {children}
          </main>
        </AppMainColumn>
      </div>
    </SidebarProvider>
  );
}

export function AdminAppLayoutFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh w-full bg-background">
      <AdminSidebarFallback />
      <AppMainColumn>
        <DashboardTopbarFallback />
        <main className={`flex-1 overflow-y-auto ${APP_MAIN_PADDING_CLASS}`}>
          {children}
        </main>
      </AppMainColumn>
    </div>
  );
}
