import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoginSessionRedirect } from "@/components/auth/login-session-redirect";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <LoginSessionRedirect />
      <LoginForm />
    </Suspense>
  );
}
