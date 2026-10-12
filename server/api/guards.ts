import type { UserRole } from "@/types/roles";
import type { SessionUser } from "@/types/user";

import { getCurrentUser } from "@/server/auth/session";

import { ApiError } from "./api-error";

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  return user;
}

export async function requireApiRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireApiUser();
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "Forbidden");
  }
  return user;
}

export async function requireApiAdmin(): Promise<SessionUser> {
  return requireApiRole("admin");
}

export async function requireApiWaiter(): Promise<SessionUser> {
  return requireApiRole("waiter");
}

export async function requireApiOrderManager(): Promise<SessionUser> {
  return requireApiRole("waiter", "admin");
}
