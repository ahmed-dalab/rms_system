import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import {
  buildLoginUrl,
  sanitizeNextPath,
} from "@/lib/auth/login-redirect";
import { SESSION_COOKIE_NAME } from "@/lib/constants/auth";
import { getSessionState } from "@/server/auth/session";
import type { SessionUser } from "@/types/user";

export type { SessionUser };

/**
 * Server-side guard for data loaders and actions.
 * Client auth handles redirects for navigation; this protects RSC data.
 */
async function authenticatedImpl(): Promise<SessionUser> {
  await connection();

  const state = await getSessionState();

  if (state.kind === "authenticated") {
    return state.user;
  }

  const headerStore = await headers();
  const pathname =
    headerStore.get("x-pathname") ??
    headerStore.get("x-invoke-path") ??
    headerStore.get("next-url") ??
    "/";

  if (state.kind === "database_unavailable") {
    const params = new URLSearchParams({ message: state.message });
    redirect(`/system/unavailable?${params.toString()}`);
  }

  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );

  if (
    hasSessionCookie &&
    (state.kind === "stale_session" || state.kind === "no_profile")
  ) {
    const params = new URLSearchParams();
    const next = sanitizeNextPath(pathname);
    if (next) {
      params.set("next", next);
    }
    const query = params.toString();
    redirect(query ? `/api/auth/logout?${query}` : "/api/auth/logout");
  }

  redirect(buildLoginUrl(pathname));
}

export const authenticated = cache(authenticatedImpl);
