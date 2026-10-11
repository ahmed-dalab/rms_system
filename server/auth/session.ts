import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/constants/auth";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { findUserByFirebaseUid } from "@/server/db/repositories/user.repository";
import type { SessionUser } from "@/types/user";

export async function createSessionFromIdToken(
  idToken: string,
): Promise<void> {
  const adminAuth = getFirebaseAdminAuth();
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
  });
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return findUserByFirebaseUid(decoded.uid);
  } catch {
    return null;
  }
}

export function getDashboardPathForRole(role: SessionUser["role"]): string {
  return role === "admin" ? "/admin" : "/waiter/pos";
}
