import { connection } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DB_UNAVAILABLE_CODE } from "@/lib/errors/codes";
import { isDatabaseUnavailableError } from "@/lib/errors/database";
import { getDashboardPathForRole } from "@/lib/auth/portal-path";
import type { SessionApiResponse } from "@/lib/auth/session-types";
import {
  applyPortalPathCookie,
  createSessionFromIdToken,
  getSessionState,
} from "@/server/auth/session";

const bodySchema = z.object({
  idToken: z.string().min(1),
});

function sessionStateToResponse(state: Awaited<ReturnType<typeof getSessionState>>): {
  body: SessionApiResponse;
  status: number;
} {
  switch (state.kind) {
    case "authenticated":
      return {
        status: 200,
        body: {
          ok: true,
          user: state.user,
          redirectTo: state.redirectTo,
        },
      };
    case "anonymous":
      return {
        status: 401,
        body: {
          ok: false,
          code: "UNAUTHORIZED",
          error: "Not signed in",
        },
      };
    case "stale_session":
      return {
        status: 401,
        body: {
          ok: false,
          code: "STALE_SESSION",
          error: "Session expired. Sign in again.",
        },
      };
    case "no_profile":
      return {
        status: 403,
        body: {
          ok: false,
          code: "NO_PROFILE",
          error: "No staff profile for this account.",
        },
      };
    case "database_unavailable":
      return {
        status: 503,
        body: {
          ok: false,
          code: DB_UNAVAILABLE_CODE,
          error: state.message,
        },
      };
  }
}

/** Current session (cookie + Mongo profile). Used by client auth state. */
export async function GET() {
  await connection();
  const { body, status } = sessionStateToResponse(await getSessionState());
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  try {
    await connection();
    const json = await request.json();
    const { idToken } = bodySchema.parse(json);
    const user = await createSessionFromIdToken(idToken);
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          code: "NO_PROFILE",
          error: "No account profile found for this user",
        } satisfies SessionApiResponse,
        { status: 403 },
      );
    }
    const redirectTo = getDashboardPathForRole(user.role);
    const response = NextResponse.json({
      ok: true,
      user,
      redirectTo,
    } satisfies SessionApiResponse);
    applyPortalPathCookie(response, redirectTo);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "UNAUTHORIZED",
          error: "Invalid request body",
        } satisfies SessionApiResponse,
        { status: 400 },
      );
    }
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        {
          ok: false,
          code: DB_UNAVAILABLE_CODE,
          error: error.message,
        } satisfies SessionApiResponse,
        { status: 503 },
      );
    }
    console.error("[auth/session]", error);
    return NextResponse.json(
      {
        ok: false,
        code: "UNAUTHORIZED",
        error: "Failed to create session",
      } satisfies SessionApiResponse,
      { status: 401 },
    );
  }
}
