import type { UserRole } from "@/types/roles";

export type SessionUser = {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
};
