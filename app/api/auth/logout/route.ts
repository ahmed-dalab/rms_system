import { NextResponse } from "next/server";

import {
  buildLoginUrl,
  sanitizeNextPath,
} from "@/lib/auth/login-redirect";
import { destroySession } from "@/server/auth/session";

/** Clears auth cookies and sends the browser to login (used when RSC auth fails). */
export async function GET(request: Request) {
  await destroySession();
  const next = sanitizeNextPath(new URL(request.url).searchParams.get("next"));
  const loginPath = buildLoginUrl(next ?? "/");
  return NextResponse.redirect(new URL(loginPath, request.url));
}

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
