import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { ZodError } from "zod";

import { withDb } from "@/server/db/with-db";

import { ApiError } from "./api-error";

export function jsonData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function jsonMessage(message: string, init?: ResponseInit) {
  return NextResponse.json({ message }, init);
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const json = await request.json();
  return schema.parse(json);
}

export async function withApiHandler(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await withDb(handler);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof ZodError) {
      return jsonError(
        error.issues[0]?.message ?? "Invalid request body",
        400,
      );
    }
    console.error("[api]", error);
    return jsonError("Internal server error", 500);
  }
}
