import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HomeLanding() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <UtensilsCrossed className="size-6" />
      </div>
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Restaurant Management System
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin menu setup, waiter POS, and order tracking in one place.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
