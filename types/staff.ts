import type { UserRole } from "@/types/roles";

export type StaffMember = {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
};
