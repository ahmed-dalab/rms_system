import { AppMainColumn } from "@/components/layout/app-main-column";
import {
  DashboardTopbar,
  DashboardTopbarFallback,
} from "@/components/layout/dashboard-topbar";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import {
  WaiterSidebar,
  WaiterSidebarFallback,
} from "@/components/waiter/waiter-sidebar";
import { APP_MAIN_PADDING_CLASS } from "@/lib/constants/layout";
import { requireUser } from "@/server/auth/guards";

type WaiterAppLayoutProps = {
  children: React.ReactNode;
};

export async function WaiterAppLayout({ children }: WaiterAppLayoutProps) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <div className="min-h-svh w-full bg-background">
        <WaiterSidebar />
        <AppMainColumn>
          <DashboardTopbar user={user} portalLabel="Waiter" />
          <main className={`flex-1 overflow-y-auto ${APP_MAIN_PADDING_CLASS}`}>
            {children}
          </main>
        </AppMainColumn>
      </div>
    </SidebarProvider>
  );
}

export function WaiterAppLayoutFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh w-full bg-background">
      <WaiterSidebarFallback />
      <AppMainColumn>
        <DashboardTopbarFallback />
        <main className={`flex-1 overflow-y-auto ${APP_MAIN_PADDING_CLASS}`}>
          {children}
        </main>
      </AppMainColumn>
    </div>
  );
}
