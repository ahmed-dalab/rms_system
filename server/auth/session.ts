import { cookies } from "next/headers";

import { getDashboardPathForRole } from "@/lib/auth/portal-path";
import {
  PORTAL_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/constants/auth";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { isDatabaseUnavailableError } from "@/lib/errors/database";
import { findUserByFirebaseUid } from "@/server/db/repositories/user.repository";
import type { SessionUser } from "@/types/user";

export type SessionState =
  | { kind: "anonymous" }
  | { kind: "authenticated"; user: SessionUser; redirectTo: string }
  | { kind: "stale_session" }
  | { kind: "no_profile" }
  | { kind: "database_unavailable"; message: string };

export { getDashboardPathForRole } from "@/lib/auth/portal-path";

export function sessionCookieOptions(maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000)) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function setPortalPathCookie(path: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PORTAL_COOKIE_NAME, path, sessionCookieOptions());
}

/** Route handlers must set cookies on the redirect response (not only via cookies()). */
export function applyPortalPathCookie(
  response: import("next/server").NextResponse,
  path: string,
) {
  response.cookies.set(PORTAL_COOKIE_NAME, path, sessionCookieOptions());
}

export function clearAuthCookiesOnResponse(
  response: import("next/server").NextResponse,
) {
  const cleared = sessionCookieOptions(0);
  response.cookies.set(SESSION_COOKIE_NAME, "", cleared);
  response.cookies.set(PORTAL_COOKIE_NAME, "", cleared);
}

export async function createSessionFromIdToken(
  idToken: string,
): Promise<SessionUser | null> {
  const adminAuth = getFirebaseAdminAuth();
  const decoded = await adminAuth.verifyIdToken(idToken);
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const user = await findUserByFirebaseUid(decoded.uid);
  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, sessionCookieOptions());
  await setPortalPathCookie(getDashboardPathForRole(user.role));
  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    try {
      const adminAuth = getFirebaseAdminAuth();
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // Cookie may already be invalid; still clear it.
    }
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  cookieStore.set(PORTAL_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export async function rememberPortalForUser(user: SessionUser): Promise<void> {
  await setPortalPathCookie(getDashboardPathForRole(user.role));
}

export async function getSessionState(): Promise<SessionState> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return { kind: "anonymous" };
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, false);
    try {
      const user = await findUserByFirebaseUid(decoded.uid);
      if (!user) {
        return { kind: "no_profile" };
      }
      return {
        kind: "authenticated",
        user,
        redirectTo: getDashboardPathForRole(user.role),
      };
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return {
          kind: "database_unavailable",
          message: error.message,
        };
      }
      throw error;
    }
  } catch {
    return { kind: "stale_session" };
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const state = await getSessionState();
  return state.kind === "authenticated" ? state.user : null;
}
