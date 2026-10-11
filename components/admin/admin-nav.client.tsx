"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebar } from "@/components/layout/sidebar-provider";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_SECTIONS,
} from "@/lib/constants/admin-nav";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <nav className="space-y-4">
      {ADMIN_NAV_SECTIONS.map((section) => {
        const items = ADMIN_NAV_ITEMS.filter((item) => item.section === section);
        if (items.length === 0) {
          return null;
        }
        return (
          <div key={section}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
              {section}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <span
                        className="flex h-9 cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 text-sm text-sidebar-muted"
                        title="Coming soon"
                      >
                        <item.icon className="size-4 shrink-0 opacity-50" />
                        {item.label}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-sidebar-muted",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
