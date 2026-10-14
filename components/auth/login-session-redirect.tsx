"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { sanitizeNextPath } from "@/lib/auth/login-redirect";

/** If already signed in, skip the login form and go to the portal. */
export function LoginSessionRedirect() {
  const { status, redirectTo } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== "authenticated" || !redirectTo) {
      return;
    }
    const next = sanitizeNextPath(searchParams.get("next"));
    router.replace(next ?? redirectTo);
  }, [status, redirectTo, router, searchParams]);

  return null;
}
