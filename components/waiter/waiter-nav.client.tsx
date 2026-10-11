"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebar } from "@/components/layout/sidebar-provider";
import { WAITER_NAV_ITEMS } from "@/lib/constants/waiter-nav";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/waiter/pos") {
    return pathname === "/waiter/pos" || pathname === "/waiter";
  }
  if (href === "/waiter/orders") {
    return (
      pathname === "/waiter/orders" ||
      (pathname.startsWith("/waiter/orders/") &&
        pathname !== "/waiter/orders/new")
    );
  }
  return pathname.startsWith(href);
}

export function WaiterNav() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <nav>
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
        Floor
      </p>
      <ul className="flex flex-col gap-0.5">
        {WAITER_NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-sidebar-muted",
                  )}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
