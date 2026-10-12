import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { HomeAuthRedirect } from "@/components/home/home-auth-redirect";

function HomeLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2 className="size-6 animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeAuthRedirect />
    </Suspense>
  );
}
