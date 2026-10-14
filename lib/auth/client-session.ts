"use client";

import type { SessionApiResponse } from "@/lib/auth/session-types";
import { getFirebaseAuth } from "@/lib/firebase/client";

export class SessionEstablishError extends Error {
  constructor(
    message: string,
    readonly code?: Extract<SessionApiResponse, { ok: false }>["code"],
  ) {
    super(message);
    this.name = "SessionEstablishError";
  }
}

/** Creates the session cookie and returns the user's portal path. */
export async function establishServerSession(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new SessionEstablishError("No signed-in Firebase user");
  }

  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const body = (await response.json()) as SessionApiResponse;
  if (!body.ok) {
    throw new SessionEstablishError(body.error, body.code);
  }

  return body.redirectTo;
}

export async function logoutFromServer(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
