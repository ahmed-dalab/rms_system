import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarTrigger } from "@/components/layout/sidebar-trigger";
import { UserChip } from "@/components/layout/user-chip";
import type { SessionUser } from "@/types/user";

type DashboardTopbarProps = {
  user: SessionUser;
  portalLabel: string;
};

export function DashboardTopbar({ user, portalLabel }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/90 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <p className="truncate text-sm font-medium text-muted-foreground">
          {portalLabel}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <UserChip user={user} />
        <div className="h-6 w-px bg-border" aria-hidden />
        <LogoutButton variant="ghost" />
      </div>
    </header>
  );
}

export function DashboardTopbarFallback() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
    </header>
  );
}
