import { PageShell } from "@/components/layout/page-shell";

type AdminPageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminPageShell({
  title,
  description,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <PageShell
      title={title}
      description={description}
      actions={actions}
    >
      {children}
    </PageShell>
  );
}
