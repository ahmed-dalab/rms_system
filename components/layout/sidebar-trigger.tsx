"use client";

import { Menu } from "lucide-react";

import { useSidebar } from "@/components/layout/sidebar-provider";
import { Button } from "@/components/ui/button";

export function SidebarTrigger() {
  const { toggle } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 md:hidden"
      onClick={toggle}
      aria-label="Open navigation"
    >
      <Menu className="size-4" />
    </Button>
  );
}
