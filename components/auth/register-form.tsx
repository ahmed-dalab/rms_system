"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { AuthPanel } from "@/components/auth/auth-panel";
import { RoleSelect } from "@/components/auth/role-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { establishServerSession } from "@/lib/auth/client-session";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { UserRole } from "@/types/roles";
import {
  registerSchema,
  type RegisterInput,
} from "@/validations/auth.schema";

type RegisterFormProps = {
  allowAdminRegister?: boolean;
};

export function RegisterForm({ allowAdminRegister = false }: RegisterFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "waiter" as UserRole,
    },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      await updateProfile(credential.user, {
        displayName: values.displayName,
      });

      const idToken = await credential.user.getIdToken();
      const profileResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          displayName: values.displayName,
          role: values.role,
        }),
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to save user profile");
      }

      await establishServerSession();
      router.push("/");
      router.refresh();
    } catch {
      setFormError("Could not create account. Email may already be in use.");
    }
  }

  return (
    <AuthPanel
      title="Create account"
      description={
        allowAdminRegister
          ? "Choose admin or waiter. Credentials are managed by Firebase."
          : "New accounts are registered as waiters."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Full name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            className="h-9"
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className="text-xs text-destructive">{errors.displayName.message}</p>
          )}
        </div>

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

        {allowAdminRegister ? (
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <RoleSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  allowedRoles={["admin", "waiter"]}
                />
              )}
            />
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>
        ) : (
          <input type="hidden" {...register("role")} />
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-9"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="h-9"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {formError && (
          <p className="text-xs text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
}
