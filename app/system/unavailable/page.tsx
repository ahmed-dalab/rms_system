"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { DatabaseUnavailablePanel } from "@/components/system/database-unavailable-panel";

function UnavailableContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <DatabaseUnavailablePanel
      message={message}
      onRetry={() => window.location.reload()}
    />
  );
}

export default function SystemUnavailablePage() {
  return (
    <Suspense
      fallback={
        <DatabaseUnavailablePanel onRetry={() => window.location.reload()} />
      }
    >
      <UnavailableContent />
    </Suspense>
  );
}
