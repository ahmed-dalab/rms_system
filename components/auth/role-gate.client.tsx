"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { getDashboardPathForRole } from "@/lib/auth/portal-path";
import type { UserRole } from "@/types/roles";

export function RoleGateClient({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user && user.role !== role) {
      router.replace(getDashboardPathForRole(user.role));
    }
  }, [status, user, role, router]);

  if (status !== "authenticated" || !user || user.role !== role) {
    return null;
  }

  return children;
}
