"use client";

import { getFirebaseAuth } from "@/lib/firebase/client";

export async function establishServerSession(): Promise<void> {
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
}

export async function logoutFromServer(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
