import type { SessionUser } from "@/types/user";

export const PORTAL_PATHS = {
  admin: "/admin",
  waiter: "/waiter/pos",
} as const;

export function getDashboardPathForRole(role: SessionUser["role"]): string {
  return role === "admin" ? PORTAL_PATHS.admin : PORTAL_PATHS.waiter;
}

export function isSafePortalPath(path: string): boolean {
  return (
    path === PORTAL_PATHS.admin || path === PORTAL_PATHS.waiter
  );
}
