import dynamic from "next/dynamic";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listStaffMembers } from "@/server/db/repositories/user.repository";

const StaffManager = dynamic(
  () =>
    import("@/components/admin/staff/staff-manager.client").then(
      (mod) => mod.StaffManager,
    ),
  { loading: () => <Skeleton className="h-48 w-full" /> },
);

export async function StaffContent() {
  const staff = await listStaffMembers();

  return (
    <AdminPageShell
      title="Staff"
      description="Create and manage waiter accounts. Admins are listed for reference only."
    >
      <StaffManager staff={staff} />
    </AdminPageShell>
  );
}
