import { NextResponse, type NextRequest } from "next/server";

import { buildLoginUrl } from "@/lib/auth/login-redirect";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
  SESSION_COOKIE_NAME,
} from "@/lib/constants/auth";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function withPathnameHeader(
  request: NextRequest,
  pathname: string,
): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return requestHeaders;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  const isAuthRoute =
    pathname === AUTH_ROUTES.login || pathname === AUTH_ROUTES.register;
  const isProtected = isProtectedPath(pathname);

  if (isProtected && !hasSessionCookie) {
    return NextResponse.redirect(
      new URL(buildLoginUrl(pathname), request.url),
    );
  }

  if (isAuthRoute && hasSessionCookie) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next({
    request: {
      headers: withPathnameHeader(request, pathname),
    },
  });
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/waiter",
    "/waiter/:path*",
    "/login",
    "/register",
  ],
};
