import { APP_SIDEBAR_OFFSET_CLASS } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

type AppMainColumnProps = {
  children: React.ReactNode;
  withSidebar?: boolean;
  className?: string;
};

/** Main column beside fixed sidebar — full viewport height */
export function AppMainColumn({
  children,
  withSidebar = true,
  className,
}: AppMainColumnProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col",
        withSidebar && APP_SIDEBAR_OFFSET_CLASS,
        className,
      )}
    >
      {children}
    </div>
  );
}
