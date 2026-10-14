"use client";

import {
  Loader2,
  Minus,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { SuccessBanner } from "@/components/ui/success-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OrderTotalsSummary } from "@/components/orders/order-totals-summary";
import { calculateTotalWithVat } from "@/lib/constants/tax";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import {
  createOrderAction,
  type OrderActionState,
} from "@/server/actions/order.actions";
import type { MenuItemRecord } from "@/types/menu-item";
import type { TableRecord } from "@/types/table";

const initialState: OrderActionState = { ok: false, message: "" };

type PosTerminalProps = {
  tables: TableRecord[];
  menuItems: MenuItemRecord[];
  busyTableIds: string[];
};

export function PosTerminal({
  tables,
  menuItems,
  busyTableIds,
}: PosTerminalProps) {
  const [state, formAction, pending] = useActionState(
    createOrderAction,
    initialState,
  );
  const busy = useMemo(() => new Set(busyTableIds), [busyTableIds]);
  const [tableId, setTableId] = useState<string | null>(
    () => (tables.find((t) => !busy.has(t.id)) ?? tables[0])?.id ?? null,
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const selectedTable = tables.find((t) => t.id === tableId);

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((m) => m.categoryName));
    return ["all", ...Array.from(set).sort()];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.categoryName === activeCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

  const cartLines = useMemo(
    () =>
      menuItems
        .map((item) => ({ item, qty: cart[item.id] ?? 0 }))
        .filter((line) => line.qty > 0),
    [cart, menuItems],
  );

  const itemsPayload = useMemo(
    () =>
      cartLines.map((line) => ({
        menuItemId: line.item.id,
        quantity: line.qty,
      })),
    [cartLines],
  );

  const subtotal = cartLines.reduce(
    (sum, line) => sum + line.item.price * line.qty,
    0,
  );
  const totalWithVat = calculateTotalWithVat(subtotal);
  const itemCount = cartLines.reduce((sum, line) => sum + line.qty, 0);

  if (state.ok && state.orderId && state.orderId !== lastOrderId) {
    setLastOrderId(state.orderId);
    setCart({});
  }

  function adjustQty(menuItemId: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const value = Math.max(0, Math.min(99, (next[menuItemId] ?? 0) + delta));
      if (value === 0) {
        delete next[menuItemId];
      } else {
        next[menuItemId] = value;
      }
      return next;
    });
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={Users}
          title="No tables configured"
          description="Ask an admin to add tables before taking orders."
        />
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items available"
          description="Ask an admin to add or enable menu items."
        />
      </div>
    );
  }

  const canSend = !pending && itemCount > 0 && Boolean(tableId);

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[13rem_minmax(0,1fr)_22rem]"
    >
      <input type="hidden" name="items" value={JSON.stringify(itemsPayload)} />
      <input type="hidden" name="tableId" value={tableId ?? ""} />

      <aside className="flex shrink-0 flex-col border-b border-border bg-card lg:min-h-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tables
          </p>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            Open order
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-3 pb-3 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:content-start lg:overflow-y-auto">
          {tables.map((table) => {
            const selected = tableId === table.id;
            const isBusy = busy.has(table.id);
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => setTableId(table.id)}
                aria-pressed={selected}
                className={cn(
                  "relative flex min-w-[4.75rem] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-2.5 transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/50 hover:bg-accent/40",
                )}
              >
                <span className="text-sm font-semibold">{table.label}</span>
                <span
                  className={cn(
                    "mt-0.5 flex items-center gap-1 text-[11px]",
                    selected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  <Users className="size-3" />
                  {table.capacity}
                </span>
                {isBusy ? (
                  <span
                    className={cn(
                      "absolute right-1.5 top-1.5 size-2 rounded-full",
                      selected ? "bg-primary-foreground" : "bg-primary",
                    )}
                    title="Has an open order"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-col lg:min-h-0">
        <div className="sticky top-14 z-10 space-y-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:static">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu…"
              className="h-10 bg-card pl-9 pr-9"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "h-8 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-medium capitalize transition-colors",
                  activeCategory === cat
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50",
                )}
              >
                {cat === "all" ? "All items" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 lg:min-h-0 lg:overflow-y-auto">
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No items match"
              description="Try another search or category."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredItems.map((item) => {
                const qty = cart[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => adjustQty(item.id, 1)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-all hover:-translate-y-px hover:border-primary/60 hover:shadow-md active:translate-y-0",
                      qty > 0 ? "border-primary ring-1 ring-primary" : "border-border",
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full bg-muted">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground/40">
                          <UtensilsCrossed className="size-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.categoryName}
                      </span>
                      <span className="mt-0.5 line-clamp-2 pr-6 text-sm font-semibold leading-snug">
                        {item.name}
                      </span>
                      <span className="mt-auto flex w-full items-center justify-between pt-2">
                        <span className="text-sm font-bold text-primary tabular-nums">
                          {formatMoney(item.price)}
                        </span>
                        <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          <Plus className="size-3.5" />
                        </span>
                      </span>
                    </div>
                    {qty > 0 ? (
                      <span className="absolute right-2 top-2 flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground tabular-nums">
                        {qty}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <aside
        id="pos-ticket"
        className="flex shrink-0 scroll-mt-14 flex-col border-t border-border bg-card lg:min-h-0 lg:border-l lg:border-t-0"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ticket
            </p>
            <p className="mt-0.5 truncate text-lg font-semibold">
              {selectedTable ? `Table ${selectedTable.label}` : "Select a table"}
            </p>
            {selectedTable ? (
              <p className="text-xs text-muted-foreground">
                {selectedTable.capacity} seats
                {busy.has(selectedTable.id) ? " · has an open order" : ""}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 text-muted-foreground"
            onClick={() => setCart({})}
            disabled={itemCount === 0}
          >
            <RotateCcw />
            Clear
          </Button>
        </div>

        <ul className="divide-y divide-border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {cartLines.length === 0 ? (
            <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
              <ReceiptText className="size-6 text-muted-foreground/60" />
              Tap menu items to build the ticket.
            </li>
          ) : (
            cartLines.map(({ item, qty }) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatMoney(item.price)} each
                  </p>
                </div>
                <div className="flex items-center rounded-md border border-border">
                  <button
                    type="button"
                    className="flex size-8 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => adjustQty(item.id, -1)}
                    aria-label={`Remove one ${item.name}`}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <button
                    type="button"
                    className="flex size-8 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => adjustQty(item.id, 1)}
                    aria-label={`Add one ${item.name}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <span className="w-16 text-right text-sm font-semibold tabular-nums">
                  {formatMoney(item.price * qty)}
                </span>
              </li>
            ))
          )}
        </ul>

        <div className="space-y-3 border-t border-border bg-muted/30 p-4">
          <Textarea
            name="notes"
            placeholder="Order notes (allergies, no onions…)"
            rows={2}
            className="min-h-[3.5rem] resize-none bg-card text-sm"
          />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Items</span>
              <span className="tabular-nums">{itemCount}</span>
            </div>
            <OrderTotalsSummary subtotal={subtotal} emphasis="pos" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={!canSend}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            Take order
          </Button>

          {state.message && !state.ok ? (
            <p className="text-center text-xs text-destructive">
              {state.message}
            </p>
          ) : null}
          {state.ok && lastOrderId ? (
            <SuccessBanner className="justify-between">
              <span>Order taken</span>
              <Link
                href={`/waiter/orders/${lastOrderId}`}
                className="text-xs font-semibold text-success underline-offset-2 hover:underline"
              >
                View order
              </Link>
            </SuccessBanner>
          ) : null}
        </div>
      </aside>

      {itemCount > 0 ? (
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-border bg-secondary px-4 py-3 text-secondary-foreground lg:hidden">
          <div className="leading-tight">
            <p className="text-xs text-secondary-foreground/70">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {selectedTable ? ` · Table ${selectedTable.label}` : ""}
            </p>
            <p className="text-lg font-bold tabular-nums">
              {formatMoney(totalWithVat)}
            </p>
            <p className="text-[10px] text-secondary-foreground/70">
              incl. 5% VAT
            </p>
          </div>
          <Button asChild size="sm">
            <a href="#pos-ticket">
              <ReceiptText />
              Review ticket
            </a>
          </Button>
        </div>
      ) : null}
    </form>
  );
}
