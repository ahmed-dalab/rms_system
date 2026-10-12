import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("w-full space-y-5", className)}>
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
