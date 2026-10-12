import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/user";

function initialsFor(user: SessionUser): string {
  const source = user.displayName?.trim() || user.email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return letters.join("") || "?";
}

type UserChipProps = {
  user: SessionUser;
  tone?: "light" | "dark";
  className?: string;
};

export function UserChip({ user, tone = "light", className }: UserChipProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initialsFor(user)}
      </span>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p
          className={cn(
            "max-w-[12rem] truncate text-sm font-medium",
            tone === "dark" ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          {user.displayName ?? user.email}
        </p>
        <p
          className={cn(
            "text-[11px] capitalize",
            tone === "dark" ? "text-sidebar-muted" : "text-muted-foreground",
          )}
        >
          {user.role}
        </p>
      </div>
    </div>
  );
}
