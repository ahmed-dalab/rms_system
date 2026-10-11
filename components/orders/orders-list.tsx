import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/layout/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/currency";
import type { OrderRecord } from "@/types/order";

type OrdersListProps = {
  orders: OrderRecord[];
  detailBasePath: "/waiter/orders" | "/admin/orders";
  emptyAction?: { href: string; label: string };
};

export function OrdersList({
  orders,
  detailBasePath,
  emptyAction,
}: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders"
        description={
          emptyAction
            ? "Nothing to show for this filter."
            : "Orders appear here once waiters send tickets from the POS."
        }
        action={
          emptyAction ? (
            <Button asChild size="sm">
              <Link href={emptyAction.href}>{emptyAction.label}</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Table</DataTableHeaderCell>
        <DataTableHeaderCell>Waiter</DataTableHeaderCell>
        <DataTableHeaderCell align="right">Total</DataTableHeaderCell>
        <DataTableHeaderCell>Status</DataTableHeaderCell>
        <DataTableHeaderCell>Placed</DataTableHeaderCell>
        <DataTableHeaderCell align="right"> </DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {orders.map((order) => (
          <DataTableRow key={order.id}>
            <DataTableCell className="font-medium">
              {order.tableLabel}
            </DataTableCell>
            <DataTableCell className="text-muted-foreground">
              {order.waiterName}
            </DataTableCell>
            <DataTableCell align="right" className="font-medium">
              {formatMoney(order.subtotal)}
            </DataTableCell>
            <DataTableCell>
              <OrderStatusBadge status={order.status} />
            </DataTableCell>
            <DataTableCell className="text-muted-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </DataTableCell>
            <DataTableCell align="right">
              <Button asChild variant="ghost" size="sm">
                <Link href={`${detailBasePath}/${order.id}`}>Open</Link>
              </Button>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
