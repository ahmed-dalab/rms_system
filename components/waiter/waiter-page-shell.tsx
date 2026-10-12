import { PageShell } from "@/components/layout/page-shell";
import { APP_MAIN_PADDING_CLASS } from "@/lib/constants/layout";

type WaiterPageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function WaiterPageShell({
  title,
  description,
  actions,
  children,
}: WaiterPageShellProps) {
  return (
    <PageShell
      title={title}
      description={description}
      actions={actions}
      className={APP_MAIN_PADDING_CLASS}
    >
      {children}
    </PageShell>
  );
}
