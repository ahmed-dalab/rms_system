"use client";

import { getFirebaseAuth } from "@/lib/firebase/client";

/** Creates the session cookie and returns the user's portal path. */
export async function establishServerSession(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No signed-in Firebase user");
  }

  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to establish server session");
  }

  const body = (await response.json()) as { redirectTo?: string };
  return body.redirectTo ?? "/";
}

export async function logoutFromServer(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
