export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "__rms_session";

export const SESSION_MAX_AGE_MS =
  Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS ?? 5) * 24 * 60 * 60 * 1000;

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
} as const;

export const DASHBOARD_ROUTES = {
  admin: "/admin",
  waiter: "/waiter",
} as const;

/** Routes that require a session cookie (validated on the server) */
export const PROTECTED_ROUTE_PREFIXES = [
  DASHBOARD_ROUTES.admin,
  DASHBOARD_ROUTES.waiter,
] as const;
