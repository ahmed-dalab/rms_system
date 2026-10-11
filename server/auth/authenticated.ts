import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildLoginUrl } from "@/lib/auth/login-redirect";
import { SESSION_COOKIE_NAME } from "@/lib/constants/auth";
import {
  destroySession,
  getCurrentUser,
} from "@/server/auth/session";
import type { SessionUser } from "@/types/user";

export type { SessionUser };

/**
 * Ensures a valid session + MongoDB user profile.
 * Redirects to `/login?next=…` when unauthenticated.
 */
export async function authenticated(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user) {
    return user;
  }

  const cookieStore = await cookies();
  if (cookieStore.get(SESSION_COOKIE_NAME)?.value) {
    await destroySession();
  }

  const headerStore = await headers();
  const pathname =
    headerStore.get("x-pathname") ??
    headerStore.get("x-invoke-path") ??
    headerStore.get("next-url") ??
    "/";

  redirect(buildLoginUrl(pathname));
}
