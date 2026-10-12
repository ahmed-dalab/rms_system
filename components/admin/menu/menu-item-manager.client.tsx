"use client";

import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { CategorySelect } from "@/components/admin/category-select";
import { MenuItemImageField } from "@/components/admin/menu/menu-item-image-field.client";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/layout/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { PageToolbar } from "@/components/layout/page-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format/currency";
import {
  createMenuItemAction,
  deleteMenuItemAction,
  updateMenuItemAction,
  type MenuItemActionState,
} from "@/server/actions/menu-item.actions";
import type { CategoryRecord } from "@/types/category";
import type { MenuItemRecord } from "@/types/menu-item";

const initialState: MenuItemActionState = { ok: false, message: "" };

type MenuItemManagerProps = {
  items: MenuItemRecord[];
  categories: CategoryRecord[];
};

export function MenuItemManager({ items, categories }: MenuItemManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemRecord | null>(null);
  const [createCategoryId, setCreateCategoryId] = useState<string | null>(
    categories.find((c) => c.isActive)?.id ?? categories[0]?.id ?? null,
  );
  const [createState, createFormAction, createPending] = useActionState(
    createMenuItemAction,
    initialState,
  );

  useEffect(() => {
    if (createState.ok) {
      setCreateOpen(false);
      router.refresh();
    }
  }, [createState.ok, router]);

  if (categories.length === 0) {
    return (
      <EmptyState
        title="Create categories first"
        description="Menu items must belong to a category."
        action={
          <Button asChild size="sm">
            <Link href="/admin/categories">Go to categories</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageToolbar>
        <p className="text-sm text-muted-foreground">
          {items.length} menu item{items.length === 1 ? "" : "s"}
        </p>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          Add item
        </Button>
      </PageToolbar>

      {items.length === 0 ? (
        <EmptyState
          title="No menu items yet"
          description="Add dishes and assign each one to a category."
          action={
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              Add item
            </Button>
          }
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Photo</DataTableHeaderCell>
            <DataTableHeaderCell>Item</DataTableHeaderCell>
            <DataTableHeaderCell>Category</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Price</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onEdit={() => setEditItem(item)}
              />
            ))}
          </DataTableBody>
        </DataTable>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add menu item"
        description="Name, price, and category are required."
        className="w-[min(100%,32rem)]"
      >
        <form action={createFormAction} className="space-y-4">
          <MenuItemFormFields
            key={createOpen ? "create-open" : "create-closed"}
            idPrefix="create"
            categories={categories}
            categoryId={createCategoryId}
            onCategoryChange={setCreateCategoryId}
            disabled={createPending}
          />
          <FormFooter
            pending={createPending || !createCategoryId}
            submitLabel="Create item"
            onCancel={() => setCreateOpen(false)}
            message={createState.message}
            ok={createState.ok}
          />
        </form>
      </Modal>

      {editItem ? (
        <EditMenuItemModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(null)}
        />
      ) : null}
    </div>
  );
}

function MenuItemRow({
  item,
  onEdit,
}: {
  item: MenuItemRecord;
  onEdit: () => void;
}) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteMenuItemAction,
    initialState,
  );

  return (
    <DataTableRow>
      <DataTableCell className="w-14">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="size-11 rounded-md border border-border object-cover"
          />
        ) : (
          <span className="flex size-11 items-center justify-center rounded-md border border-dashed border-border bg-muted text-[10px] text-muted-foreground">
            —
          </span>
        )}
      </DataTableCell>
      <DataTableCell>
        <p className="font-medium">{item.name}</p>
        {item.description ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </DataTableCell>
      <DataTableCell className="text-muted-foreground">
        {item.categoryName}
      </DataTableCell>
      <DataTableCell align="right" className="font-medium">
        {formatMoney(item.price)}
      </DataTableCell>
      <DataTableCell>
        <Badge variant={item.isAvailable ? "default" : "muted"}>
          {item.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </DataTableCell>
      <DataTableCell align="right">
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <form action={deleteFormAction}>
            <input type="hidden" name="id" value={item.id} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={deletePending}
            >
              {deletePending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
            </Button>
          </form>
        </div>
        {deleteState.message && !deleteState.ok ? (
          <p className="mt-1 text-xs text-destructive">{deleteState.message}</p>
        ) : null}
      </DataTableCell>
    </DataTableRow>
  );
}

function EditMenuItemModal({
  item,
  categories,
  onClose,
}: {
  item: MenuItemRecord;
  categories: CategoryRecord[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateMenuItemAction,
    initialState,
  );

  useEffect(() => {
    if (updateState.ok) {
      onClose();
      router.refresh();
    }
  }, [updateState.ok, onClose, router]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit menu item"
      description={item.name}
      className="w-[min(100%,32rem)]"
    >
      <form action={updateFormAction} className="space-y-4">
        <input type="hidden" name="id" value={item.id} />
        <MenuItemFormFields
          idPrefix={`edit-${item.id}`}
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          disabled={updatePending}
          defaults={item}
        />
        <FormFooter
          pending={updatePending || !categoryId}
          submitLabel="Save changes"
          onCancel={onClose}
          message={updateState.message}
          ok={updateState.ok}
        />
      </form>
    </Modal>
  );
}

function MenuItemFormFields({
  idPrefix,
  categories,
  categoryId,
  onCategoryChange,
  disabled,
  defaults,
}: {
  idPrefix: string;
  categories: CategoryRecord[];
  categoryId: string | null;
  onCategoryChange: (id: string) => void;
  disabled?: boolean;
  defaults?: MenuItemRecord;
}) {
  return (
    <>
      <MenuItemImageField
        idPrefix={idPrefix}
        defaultUrl={defaults?.imageUrl}
        disabled={disabled}
      />
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={defaults?.name}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={defaults?.description ?? ""}
          rows={2}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-price`}>Price</Label>
          <Input
            id={`${idPrefix}-price`}
            name="price"
            type="number"
            min={0}
            step={0.01}
            defaultValue={defaults?.price}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-category`}>Category</Label>
          <CategorySelect
            inputId={`${idPrefix}-category`}
            categories={categories}
            value={categoryId}
            onChange={onCategoryChange}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-sortOrder`}>Display order</Label>
          <Input
            id={`${idPrefix}-sortOrder`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={defaults?.sortOrder ?? 0}
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            id={`${idPrefix}-isAvailable`}
            name="isAvailable"
            type="checkbox"
            defaultChecked={defaults?.isAvailable ?? true}
            className="size-4 accent-[var(--primary)]"
          />
          <Label htmlFor={`${idPrefix}-isAvailable`}>Available to order</Label>
        </div>
      </div>
    </>
  );
}

function FormFooter({
  pending,
  submitLabel,
  onCancel,
  message,
  ok,
}: {
  pending: boolean;
  submitLabel: string;
  onCancel: () => void;
  message: string;
  ok: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
      {message ? (
        <p className={ok ? "text-xs text-primary" : "text-xs text-destructive"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
