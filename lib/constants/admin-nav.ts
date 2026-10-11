import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  Square,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section: "Overview" | "Menu" | "Operations" | "Insights";
  disabled?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    section: "Menu",
  },
  {
    href: "/admin/menu",
    label: "Menu items",
    icon: UtensilsCrossed,
    section: "Menu",
  },
  {
    href: "/admin/tables",
    label: "Tables",
    icon: Square,
    section: "Menu",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ClipboardList,
    section: "Operations",
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: Users,
    section: "Operations",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
    section: "Insights",
  },
];

export const ADMIN_NAV_SECTIONS = [
  "Overview",
  "Menu",
  "Operations",
  "Insights",
] as const;
