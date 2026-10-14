"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import { logoutFromServer } from "@/lib/auth/client-session";
import { getFirebaseAuth } from "@/lib/firebase/client";

type LogoutButtonProps = {
  variant?: ButtonProps["variant"];
  className?: string;
};

export function LogoutButton({
  variant = "outline",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutFromServer();
      await signOut(getFirebaseAuth());
      await refresh();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={className}
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sign out"
    >
      <LogOut />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
}
