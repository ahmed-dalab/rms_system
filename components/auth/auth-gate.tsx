"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { DatabaseUnavailablePanel } from "@/components/system/database-unavailable-panel";
import { buildLoginUrl } from "@/lib/auth/login-redirect";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, errorMessage, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      const pathname = window.location.pathname;
      router.replace(buildLoginUrl(pathname));
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (status === "db_unavailable" || status === "error") {
    return (
      <DatabaseUnavailablePanel
        message={errorMessage}
        onRetry={() => void refresh()}
      />
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return children;
}
