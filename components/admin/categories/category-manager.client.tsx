"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

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
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/server/actions/category.actions";
import type { CategoryRecord } from "@/types/category";

const initialState: CategoryActionState = { ok: false, message: "" };

type CategoryManagerProps = {
  categories: CategoryRecord[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryRecord | null>(null);
  const [createState, createFormAction, createPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  useEffect(() => {
    if (createState.ok) {
      setCreateOpen(false);
      router.refresh();
    }
  }, [createState.ok, router]);

  return (
    <div className="space-y-4">
      <PageToolbar>
        <p className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          Add category
        </Button>
      </PageToolbar>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create sections such as Appetizers, Mains, or Drinks to organize the menu."
          action={
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              Add category
            </Button>
          }
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Name</DataTableHeaderCell>
            <DataTableHeaderCell>Slug</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Order</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => setEditCategory(category)}
              />
            ))}
          </DataTableBody>
        </DataTable>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add category"
        description="Categories group menu items for admins and waiters."
      >
        <form action={createFormAction} className="space-y-4">
          <CategoryFormFields idPrefix="create" />
          <FormFooter
            pending={createPending}
            submitLabel="Create category"
            onCancel={() => setCreateOpen(false)}
            message={createState.message}
            ok={createState.ok}
          />
        </form>
      </Modal>

      {editCategory ? (
        <EditCategoryModal
          category={editCategory}
          onClose={() => setEditCategory(null)}
        />
      ) : null}
    </div>
  );
}

function CategoryRow({
  category,
  onEdit,
}: {
  category: CategoryRecord;
  onEdit: () => void;
}) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteCategoryAction,
    initialState,
  );

  return (
    <DataTableRow>
      <DataTableCell className="font-medium">{category.name}</DataTableCell>
      <DataTableCell className="text-muted-foreground">
        {category.slug}
      </DataTableCell>
      <DataTableCell align="right">{category.sortOrder}</DataTableCell>
      <DataTableCell>
        <Badge variant={category.isActive ? "default" : "muted"}>
          {category.isActive ? "Active" : "Hidden"}
        </Badge>
      </DataTableCell>
      <DataTableCell align="right">
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <form action={deleteFormAction}>
            <input type="hidden" name="id" value={category.id} />
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

function EditCategoryModal({
  category,
  onClose,
}: {
  category: CategoryRecord;
  onClose: () => void;
}) {
  const router = useRouter();
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateCategoryAction,
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
      title="Edit category"
      description={category.slug}
      className="w-[min(100%,32rem)]"
    >
      <form action={updateFormAction} className="space-y-4">
        <input type="hidden" name="id" value={category.id} />
        <CategoryFormFields
          idPrefix={`edit-${category.id}`}
          defaults={category}
        />
        <FormFooter
          pending={updatePending}
          submitLabel="Save changes"
          onCancel={onClose}
          message={updateState.message}
          ok={updateState.ok}
        />
      </form>
    </Modal>
  );
}

function CategoryFormFields({
  idPrefix,
  defaults,
}: {
  idPrefix: string;
  defaults?: CategoryRecord;
}) {
  return (
    <>
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
            id={`${idPrefix}-isActive`}
            name="isActive"
            type="checkbox"
            defaultChecked={defaults?.isActive ?? true}
            className="size-4 accent-[var(--primary)]"
          />
          <Label htmlFor={`${idPrefix}-isActive`}>Active (visible)</Label>
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
