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
import {
  createTableAction,
  deleteTableAction,
  updateTableAction,
  type TableActionState,
} from "@/server/actions/table.actions";
import type { TableRecord } from "@/types/table";

const initialState: TableActionState = { ok: false, message: "" };

export function TableManager({ tables }: { tables: TableRecord[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTable, setEditTable] = useState<TableRecord | null>(null);
  const [createState, createFormAction, createPending] = useActionState(
    createTableAction,
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
          {tables.length} table{tables.length === 1 ? "" : "s"} on the floor
        </p>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          Add table
        </Button>
      </PageToolbar>

      {tables.length === 0 ? (
        <EmptyState
          title="No tables configured"
          description="Add dining tables so waiters can assign orders in the POS."
          action={
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              Add table
            </Button>
          }
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Label</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Seats</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {tables.map((table) => (
              <TableRow
                key={table.id}
                table={table}
                onEdit={() => setEditTable(table)}
              />
            ))}
          </DataTableBody>
        </DataTable>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add table"
        description="Labels must be unique (e.g. T1, Patio 3)."
      >
        <form action={createFormAction} className="space-y-4">
          <TableFormFields idPrefix="create" />
          <TableFormFooter
            pending={createPending}
            submitLabel="Create table"
            onCancel={() => setCreateOpen(false)}
            message={createState.message}
            ok={createState.ok}
          />
        </form>
      </Modal>

      {editTable ? (
        <EditTableModal table={editTable} onClose={() => setEditTable(null)} />
      ) : null}
    </div>
  );
}

function TableRow({
  table,
  onEdit,
}: {
  table: TableRecord;
  onEdit: () => void;
}) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteTableAction,
    initialState,
  );

  return (
    <DataTableRow>
      <DataTableCell className="font-medium">{table.label}</DataTableCell>
      <DataTableCell align="right">{table.capacity}</DataTableCell>
      <DataTableCell>
        <Badge variant={table.isActive ? "default" : "muted"}>
          {table.isActive ? "Active" : "Inactive"}
        </Badge>
      </DataTableCell>
      <DataTableCell align="right">
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <form action={deleteFormAction}>
            <input type="hidden" name="id" value={table.id} />
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

function EditTableModal({
  table,
  onClose,
}: {
  table: TableRecord;
  onClose: () => void;
}) {
  const router = useRouter();
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateTableAction,
    initialState,
  );

  useEffect(() => {
    if (updateState.ok) {
      onClose();
      router.refresh();
    }
  }, [updateState.ok, onClose, router]);

  return (
    <Modal open onClose={onClose} title="Edit table" description={table.label}>
      <form action={updateFormAction} className="space-y-4">
        <input type="hidden" name="id" value={table.id} />
        <TableFormFields idPrefix={`edit-${table.id}`} defaults={table} />
        <TableFormFooter
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

function TableFormFields({
  idPrefix,
  defaults,
}: {
  idPrefix: string;
  defaults?: TableRecord;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-label`}>Label</Label>
        <Input
          id={`${idPrefix}-label`}
          name="label"
          defaultValue={defaults?.label}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-capacity`}>Seats</Label>
        <Input
          id={`${idPrefix}-capacity`}
          name="capacity"
          type="number"
          min={1}
          defaultValue={defaults?.capacity ?? 4}
        />
      </div>
      <div className="flex items-end gap-2 pb-2">
        <input
          id={`${idPrefix}-active`}
          name="isActive"
          type="checkbox"
          defaultChecked={defaults?.isActive ?? true}
          className="size-4 accent-[var(--primary)]"
        />
        <Label htmlFor={`${idPrefix}-active`}>Active</Label>
      </div>
    </div>
  );
}

function TableFormFooter({
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
        <p className={ok ? "text-xs text-success" : "text-xs text-destructive"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
