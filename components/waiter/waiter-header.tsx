import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { UserChip } from "@/components/layout/user-chip";
import { WaiterNav } from "@/components/waiter/waiter-nav.client";
import type { SessionUser } from "@/types/user";

function Brand() {
  return (
    <Link href="/waiter/pos" className="flex shrink-0 items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        R
      </span>
      <span className="hidden leading-tight md:block">
        <span className="block text-sm font-semibold text-sidebar-foreground">
          RMS
        </span>
        <span className="block text-[11px] text-sidebar-muted">
          Waiter floor
        </span>
      </span>
    </Link>
  );
}

export function WaiterHeader({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-3 md:px-5">
      <div className="flex min-w-0 items-center gap-3 md:gap-6">
        <Brand />
        <WaiterNav />
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <UserChip user={user} tone="dark" />
        <LogoutButton
          variant="ghost"
          className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        />
      </div>
    </header>
  );
}

export function WaiterHeaderFallback() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-3 md:px-5">
      <div className="h-8 w-48 animate-pulse rounded-md bg-sidebar-accent" />
      <div className="h-8 w-28 animate-pulse rounded-md bg-sidebar-accent" />
    </header>
  );
}
