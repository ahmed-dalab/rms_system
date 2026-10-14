import { NextResponse, type NextRequest } from "next/server";

import { isSafePortalPath } from "@/lib/auth/portal-path";
import { buildLoginUrl } from "@/lib/auth/login-redirect";
import {
  AUTH_ROUTES,
  PORTAL_COOKIE_NAME,
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

function redirectToPortal(request: NextRequest): NextResponse | null {
  const portal = request.cookies.get(PORTAL_COOKIE_NAME)?.value;
  if (portal && isSafePortalPath(portal)) {
    return NextResponse.redirect(new URL(portal, request.url));
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (pathname === "/register") {
    return NextResponse.redirect(new URL(AUTH_ROUTES.login, request.url));
  }

  if (pathname === "/" && !hasSessionCookie) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.login, request.url));
  }

  if (pathname === "/" && hasSessionCookie) {
    const portalRedirect = redirectToPortal(request);
    if (portalRedirect) {
      return portalRedirect;
    }
    return NextResponse.next({
      request: {
        headers: withPathnameHeader(request, pathname),
      },
    });
  }

  const isAuthRoute = pathname === AUTH_ROUTES.login;
  const isProtected = isProtectedPath(pathname);

  if (isProtected && !hasSessionCookie) {
    return NextResponse.redirect(
      new URL(buildLoginUrl(pathname), request.url),
    );
  }

  if (isAuthRoute && hasSessionCookie) {
    const portalRedirect = redirectToPortal(request);
    if (portalRedirect) {
      return portalRedirect;
    }
    return NextResponse.next({
      request: {
        headers: withPathnameHeader(request, pathname),
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: withPathnameHeader(request, pathname),
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/waiter",
    "/waiter/:path*",
    "/login",
    "/register",
  ],
};
