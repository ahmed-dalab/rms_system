import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarTrigger } from "@/components/layout/sidebar-trigger";
import type { SessionUser } from "@/types/user";

type DashboardTopbarProps = {
  user: SessionUser;
  portalLabel: string;
};

export function DashboardTopbar({ user, portalLabel }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/90 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <p className="truncate text-sm font-medium text-muted-foreground md:hidden">
          {portalLabel}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden max-w-[10rem] truncate text-muted-foreground sm:inline md:max-w-[14rem]">
          {user.displayName ?? user.email}
        </span>
        <span className="hidden rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground sm:inline">
          {user.role}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}

export function DashboardTopbarFallback() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 w-20 animate-pulse rounded bg-muted" />
    </header>
  );
}
