import { cn } from "@/lib/utils";

type PageToolbarProps = {
  children: React.ReactNode;
  className?: string;
};

/** Filters, search, and primary actions above main content */
export function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
