import type { SessionApiResponse } from "@/lib/auth/session-types";

export async function fetchSession(): Promise<SessionApiResponse> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const body = (await response.json()) as SessionApiResponse;
  return body;
}
