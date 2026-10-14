import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SuccessBannerProps = {
  children: React.ReactNode;
  className?: string;
  /** Show check icon before children */
  icon?: boolean;
};

export function SuccessBanner({
  children,
  className,
  icon = true,
}: SuccessBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-success/35 bg-success-muted px-3 py-2 text-sm font-medium text-success-muted-foreground",
        className,
      )}
      role="status"
    >
      {icon ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : null}
      {children}
    </div>
  );
}
