"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type DatabaseUnavailablePanelProps = {
  message?: string | null;
  onRetry?: () => void;
};

export function DatabaseUnavailablePanel({
  message,
  onRetry,
}: DatabaseUnavailablePanelProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-semibold">Database unreachable</h1>
        <p className="text-sm text-muted-foreground">
          {message ??
            "The app cannot connect to MongoDB. Check MONGODB_URI, Atlas IP allowlist, and that the cluster is running."}
        </p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
