/** When false, new accounts are always waiters (recommended for production). */
export function isPublicAdminRegisterAllowed(): boolean {
  return process.env.ALLOW_PUBLIC_ADMIN_REGISTER === "true";
}
