import { APP_CONTENT_MAX_CLASS } from "@/lib/constants/layout";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
};

export function PageShell({
  title,
  description,
  actions,
  children,
  fullWidth = false,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        !fullWidth && APP_CONTENT_MAX_CLASS,
        className,
      )}
    >
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
