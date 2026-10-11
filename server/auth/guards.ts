import { redirect } from "next/navigation";

import { authenticated } from "@/server/auth/authenticated";
import { getDashboardPathForRole } from "@/server/auth/session";
import type { UserRole } from "@/types/roles";
import type { SessionUser } from "@/types/user";

/** @deprecated Use `authenticated()` — kept for existing imports */
export async function requireUser(): Promise<SessionUser> {
  return authenticated();
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await authenticated();
  if (user.role !== role) {
    redirect(getDashboardPathForRole(user.role));
  }
  return user;
}
