import type { LucideIcon } from "lucide-react";
import { ClipboardList, LayoutGrid } from "lucide-react";

export type WaiterNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const WAITER_NAV_ITEMS: WaiterNavItem[] = [
  { href: "/waiter/pos", label: "POS", icon: LayoutGrid },
  { href: "/waiter/orders", label: "Orders", icon: ClipboardList },
];
