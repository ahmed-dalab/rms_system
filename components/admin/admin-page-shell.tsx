import { PageShell } from "@/components/layout/page-shell";

type AdminPageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
};

export function AdminPageShell({
  title,
  description,
  actions,
  children,
  fullWidth,
}: AdminPageShellProps) {
  return (
    <PageShell
      title={title}
      description={description}
      actions={actions}
      fullWidth={fullWidth}
    >
      {children}
    </PageShell>
  );
}
