"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";

import { AuthPanel } from "@/components/auth/auth-panel";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import {
  SessionEstablishError,
  establishServerSession,
} from "@/lib/auth/client-session";
import { sanitizeNextPath } from "@/lib/auth/login-redirect";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { loginSchema, type LoginInput } from "@/validations/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, values.email, values.password);
      const portalPath = await establishServerSession();
      await refresh();

      const next = sanitizeNextPath(searchParams.get("next"));
      router.replace(next ?? portalPath);
      router.refresh();
    } catch (error) {
      if (error instanceof SessionEstablishError) {
        setFormError(error.message);
        return;
      }
      setFormError("Invalid email or password.");
    }
  }

  return (
    <AuthPanel
      title="Sign in"
      description="Admin and waiter access to your restaurant."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-9"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {formError && (
          <p className="text-xs text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>

      </form>
    </AuthPanel>
  );
}
