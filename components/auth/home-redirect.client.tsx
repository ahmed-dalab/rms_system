"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { DatabaseUnavailablePanel } from "@/components/system/database-unavailable-panel";
import { AUTH_ROUTES } from "@/lib/constants/auth";

export function HomeRedirect() {
  const { status, redirectTo, errorMessage, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && redirectTo) {
      router.replace(redirectTo);
    }
    if (status === "anonymous") {
      router.replace(AUTH_ROUTES.login);
    }
  }, [status, redirectTo, router]);

  if (status === "db_unavailable" || status === "error") {
    return (
      <DatabaseUnavailablePanel
        message={errorMessage}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}
