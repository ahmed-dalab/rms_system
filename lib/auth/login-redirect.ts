import { AUTH_ROUTES } from "@/lib/constants/auth";

/** Only allow same-origin relative paths after login */
export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next) {
    return null;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (trimmed === AUTH_ROUTES.login) {
    return null;
  }

  return trimmed;
}

export function buildLoginUrl(intendedPath: string): string {
  const safe = sanitizeNextPath(intendedPath) ?? intendedPath;
  const params = new URLSearchParams();
  if (safe && safe !== "/") {
    params.set("next", safe);
  }
  const query = params.toString();
  return query ? `${AUTH_ROUTES.login}?${query}` : AUTH_ROUTES.login;
}
