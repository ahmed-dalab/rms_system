import {
  WaiterHeader,
  WaiterHeaderFallback,
} from "@/components/waiter/waiter-header";
import { requireUser } from "@/server/auth/guards";

type WaiterAppLayoutProps = {
  children: React.ReactNode;
};

export async function WaiterAppLayout({ children }: WaiterAppLayoutProps) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <WaiterHeader user={user} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

export function WaiterAppLayoutFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <WaiterHeaderFallback />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
