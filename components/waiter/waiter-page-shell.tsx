import { PageShell } from "@/components/layout/page-shell";

type WaiterPageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
};

export function WaiterPageShell({
  title,
  description,
  actions,
  children,
  fullWidth,
}: WaiterPageShellProps) {
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
