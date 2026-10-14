import { DB_UNAVAILABLE_CODE } from "@/lib/errors/codes";
import type { SessionUser } from "@/types/user";

export type SessionApiCode =
  | "OK"
  | "UNAUTHORIZED"
  | "STALE_SESSION"
  | "NO_PROFILE"
  | typeof DB_UNAVAILABLE_CODE;

export type SessionApiResponse =
  | {
      ok: true;
      user: SessionUser;
      redirectTo: string;
    }
  | {
      ok: false;
      code: SessionApiCode;
      error: string;
    };

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "anonymous"
  | "db_unavailable"
  | "error";

export type AuthContextValue = {
  status: AuthStatus;
  user: SessionUser | null;
  redirectTo: string | null;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};
