"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WAITER_NAV_ITEMS } from "@/lib/constants/waiter-nav";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/waiter/pos") {
    return pathname === "/waiter/pos" || pathname === "/waiter";
  }
  return pathname.startsWith(href);
}

export function WaiterNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Waiter navigation">
      <ul className="flex items-center gap-1 rounded-lg bg-sidebar-accent/40 p-1">
        {WAITER_NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors sm:px-4",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-muted hover:text-sidebar-foreground",
                )}
              >
                <item.icon
                  className={cn("size-4", active && "text-primary")}
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
