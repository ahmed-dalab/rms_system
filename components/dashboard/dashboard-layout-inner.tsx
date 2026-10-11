import { authenticated } from "@/server/auth/authenticated";

export async function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  await authenticated();
  return children;
}
