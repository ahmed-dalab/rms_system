"use client";

import {
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
};

export function PosTerminal({ tables, menuItems }: PosTerminalProps) {
  const [state, formAction, pending] = useActionState(
    createOrderAction,
    initialState,
  );
  const [tableId, setTableId] = useState<string | null>(
    tables[0]?.id ?? null,
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

  const cartLines = useMemo(() => {
    return menuItems
      .map((item) => ({ item, qty: cart[item.id] ?? 0 }))
      .filter((line) => line.qty > 0);
  }, [cart, menuItems]);

  const itemsPayload = useMemo(
    () =>
      cartLines.map((line) => ({
        menuItemId: line.item.id,
        quantity: line.qty,
      })),
    [cartLines],
  );

  const subtotal = useMemo(
    () =>
      cartLines.reduce(
        (sum, line) => sum + line.item.price * line.qty,
        0,
      ),
    [cartLines],
  );

  const itemCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.qty, 0),
    [cartLines],
  );

  useEffect(() => {
    if (state.ok && state.orderId) {
      setLastOrderId(state.orderId);
      setCart({});
    }
  }, [state.ok, state.orderId]);

  function adjustQty(menuItemId: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[menuItemId] ?? 0;
      const value = Math.max(0, Math.min(99, current + delta));
      if (value === 0) {
        delete next[menuItemId];
      } else {
        next[menuItemId] = value;
      }
      return next;
    });
  }

  function addOne(menuItemId: string) {
    adjustQty(menuItemId, 1);
  }

  function clearCart() {
    setCart({});
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        No tables configured. Ask an admin to add tables.
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        No menu items available. Ask an admin to add menu items.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[11rem_minmax(0,1fr)_minmax(280px,320px)] lg:grid-rows-1"
    >
      <input type="hidden" name="items" value={JSON.stringify(itemsPayload)} />
      <input type="hidden" name="tableId" value={tableId ?? ""} />

      {/* Tables */}
      <aside className="shrink-0 border-b border-border bg-card lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Table
          </p>
          <p className="truncate text-sm font-medium">
            {selectedTable?.label ?? "Select"}
          </p>
        </div>
        <div className="grid max-h-32 grid-cols-4 gap-1.5 overflow-y-auto p-2 lg:max-h-none lg:grid-cols-2 lg:content-start">
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => setTableId(table.id)}
              className={cn(
                "rounded-md border px-2 py-2 text-center text-xs font-medium transition-colors sm:text-sm",
                tableId === table.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              {table.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Menu */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
        <div className="shrink-0 space-y-2 border-b border-border px-3 py-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu…"
              className="h-9 pl-8"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                type="button"
                size="sm"
                variant={activeCategory === cat ? "default" : "outline"}
                className="h-8 shrink-0 px-2.5 text-xs capitalize"
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const qty = cart[item.id] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addOne(item.id)}
                  className={cn(
                    "relative flex min-h-[72px] flex-col items-start rounded-md border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/50 hover:bg-accent/30 active:bg-accent/50",
                    qty > 0 && "border-primary bg-accent/20",
                  )}
                >
                  <span className="line-clamp-2 text-sm font-medium leading-snug">
                    {item.name}
                  </span>
                  <span className="mt-auto pt-1 text-xs font-semibold text-primary tabular-nums">
                    {formatMoney(item.price)}
                  </span>
                  {qty > 0 ? (
                    <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {qty}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {filteredItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No items match your search.
            </p>
          ) : null}
        </div>
      </section>

      {/* Ticket */}
      <aside className="flex min-h-[240px] shrink-0 flex-col bg-muted/20 lg:min-h-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ticket
            </p>
            <p className="text-sm font-medium">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={clearCart}
            disabled={itemCount === 0}
          >
            <RotateCcw />
            Clear
          </Button>
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
          {cartLines.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Tap menu items to build the ticket.
            </li>
          ) : (
            cartLines.map(({ item, qty }) => (
              <li
                key={item.id}
                className="flex items-center gap-2 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatMoney(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => adjustQty(item.id, -1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-5 text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => adjustQty(item.id, 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <span className="w-14 text-right text-sm font-medium tabular-nums">
                  {formatMoney(item.price * qty)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-destructive"
                  onClick={() => adjustQty(item.id, -qty)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </li>
            ))
          )}
        </ul>

        <div className="shrink-0 space-y-2 border-t border-border bg-card p-3">
          <Textarea
            name="notes"
            placeholder="Kitchen notes…"
            rows={2}
            className="min-h-[56px] resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatMoney(subtotal)}
            </span>
          </div>
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={pending || itemCount === 0 || !tableId}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            Send order
          </Button>
          {state.message ? (
            <p
              className={
                state.ok
                  ? "text-center text-xs text-primary"
                  : "text-center text-xs text-destructive"
              }
            >
              {state.message}
            </p>
          ) : null}
          {lastOrderId ? (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/waiter/orders/${lastOrderId}`}>
                View last order
              </Link>
            </Button>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
