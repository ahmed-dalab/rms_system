import { redirect } from "next/navigation";

import { HomeLanding } from "@/components/home/home-landing";
import {
  getCurrentUser,
  getDashboardPathForRole,
} from "@/server/auth/session";

export async function HomeAuthRedirect() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  return <HomeLanding />;
}
