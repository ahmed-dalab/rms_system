"use client";

import { cn } from "@/lib/utils";
import { APP_SIDEBAR_WIDTH_CLASS } from "@/lib/constants/layout";
import { useSidebar } from "@/components/layout/sidebar-provider";

type AppSidebarFrameProps = {
  subtitle: string;
  nav: React.ReactNode;
  className?: string;
};

export function AppSidebarFrame({
  subtitle,
  nav,
  className,
}: AppSidebarFrameProps) {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-secondary/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out md:translate-x-0",
          APP_SIDEBAR_WIDTH_CLASS,
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            R
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">RMS</p>
            <p className="truncate text-[11px] text-sidebar-muted">{subtitle}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">{nav}</div>
      </aside>
    </>
  );
}

export function AppSidebarFrameFallback() {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar md:block",
        APP_SIDEBAR_WIDTH_CLASS,
      )}
      aria-hidden
    />
  );
}
