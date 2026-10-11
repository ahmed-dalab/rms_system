import { Suspense } from "react";

import { HomeAuthRedirect } from "@/components/home/home-auth-redirect";
import { HomeLanding } from "@/components/home/home-landing";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLanding />}>
      <HomeAuthRedirect />
    </Suspense>
  );
}
