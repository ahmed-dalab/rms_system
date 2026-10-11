import { requireRole } from "@/server/auth/guards";
import type { UserRole } from "@/types/roles";

export async function RoleGate({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  await requireRole(role);
  return children;
}
