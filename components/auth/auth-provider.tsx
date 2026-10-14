"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchSession } from "@/lib/auth/session-api";
import type { AuthContextValue, AuthStatus } from "@/lib/auth/session-types";
import type { SessionUser } from "@/types/user";

const AuthContext = createContext<AuthContextValue | null>(null);

function applySessionResult(
  body: Awaited<ReturnType<typeof fetchSession>>,
): Pick<AuthContextValue, "status" | "user" | "redirectTo" | "errorMessage"> {
  if (body.ok) {
    return {
      status: "authenticated",
      user: body.user,
      redirectTo: body.redirectTo,
      errorMessage: null,
    };
  }

  if (body.code === "DB_UNAVAILABLE") {
    return {
      status: "db_unavailable",
      user: null,
      redirectTo: null,
      errorMessage: body.error,
    };
  }

  return {
    status: "anonymous",
    user: null,
    redirectTo: null,
    errorMessage:
      body.code === "NO_PROFILE" ? body.error : null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const body = await fetchSession();
      const next = applySessionResult(body);
      setStatus(next.status);
      setUser(next.user);
      setRedirectTo(next.redirectTo);
      setErrorMessage(next.errorMessage);
    } catch {
      setStatus("error");
      setUser(null);
      setRedirectTo(null);
      setErrorMessage("Could not verify session. Check your connection.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      redirectTo,
      errorMessage,
      refresh,
    }),
    [status, user, redirectTo, errorMessage, refresh],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
