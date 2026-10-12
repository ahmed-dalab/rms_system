import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createSessionFromIdToken,
  getDashboardPathForRole,
} from "@/server/auth/session";

const bodySchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { idToken } = bodySchema.parse(json);
    const user = await createSessionFromIdToken(idToken);
    return NextResponse.json({
      ok: true,
      redirectTo: user ? getDashboardPathForRole(user.role) : "/",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    console.error("[auth/session]", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 },
    );
  }
}
