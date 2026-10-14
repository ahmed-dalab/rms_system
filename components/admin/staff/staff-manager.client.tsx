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
  createWaiterAction,
  deleteWaiterAction,
  updateWaiterAction,
  type StaffActionState,
} from "@/server/actions/staff.actions";
import type { StaffMember } from "@/types/staff";

const initialState: StaffActionState = { ok: false, message: "" };

type StaffManagerProps = {
  staff: StaffMember[];
};

export function StaffManager({ staff }: StaffManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [createState, createFormAction, createPending] = useActionState(
    createWaiterAction,
    initialState,
  );

  const waiters = staff.filter((member) => member.role === "waiter");

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
          {waiters.length} waiter{waiters.length === 1 ? "" : "s"}
          {staff.length > waiters.length
            ? ` · ${staff.length - waiters.length} admin`
            : ""}
        </p>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          Add Staff
        </Button>
      </PageToolbar>

      {staff.length === 0 ? (
        <EmptyState
          title="No team members yet"
          description="Create waiter accounts with email and password. They can sign in immediately."
          action={
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              Add Staff
            </Button>
          }
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Name</DataTableHeaderCell>
            <DataTableHeaderCell>Email</DataTableHeaderCell>
            <DataTableHeaderCell>Role</DataTableHeaderCell>
            <DataTableHeaderCell>Joined</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {staff.map((member) => (
              <StaffRow
                key={member.id}
                member={member}
                onEdit={
                  member.role === "waiter"
                    ? () => setEditMember(member)
                    : undefined
                }
              />
            ))}
          </DataTableBody>
        </DataTable>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Staff"
        description="Creates Firebase sign-in and a staff profile in MongoDB."
      >
        <form action={createFormAction} className="space-y-4">
          <WaiterFormFields idPrefix="create" includePassword requiredPassword />
          <FormFooter
            pending={createPending}
            submitLabel="Create Staff"
            onCancel={() => setCreateOpen(false)}
            message={createState.message}
            ok={createState.ok}
          />
        </form>
      </Modal>

      {editMember ? (
        <EditWaiterModal
          member={editMember}
          onClose={() => setEditMember(null)}
        />
      ) : null}
    </div>
  );
}

function StaffRow({
  member,
  onEdit,
}: {
  member: StaffMember;
  onEdit?: () => void;
}) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteWaiterAction,
    initialState,
  );

  return (
    <DataTableRow>
      <DataTableCell className="font-medium">
        {member.displayName ?? "—"}
      </DataTableCell>
      <DataTableCell className="text-muted-foreground">
        {member.email}
      </DataTableCell>
      <DataTableCell>
        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
          {member.role}
        </Badge>
      </DataTableCell>
      <DataTableCell className="text-muted-foreground">
        {new Date(member.createdAt).toLocaleDateString()}
      </DataTableCell>
      <DataTableCell align="right">
        {member.role === "waiter" ? (
          <div className="flex justify-end gap-1">
            {onEdit ? (
              <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
                <Pencil />
                Edit
              </Button>
            ) : null}
            <form action={deleteFormAction}>
              <input type="hidden" name="id" value={member.id} />
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
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
        {deleteState.message && !deleteState.ok ? (
          <p className="mt-1 text-xs text-destructive">{deleteState.message}</p>
        ) : null}
      </DataTableCell>
    </DataTableRow>
  );
}

function EditWaiterModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}) {
  const router = useRouter();
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateWaiterAction,
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
      title="Edit Staff"
      description={member.email}
    >
      <form action={updateFormAction} className="space-y-4">
        <input type="hidden" name="id" value={member.id} />
        <WaiterFormFields
          idPrefix={`edit-${member.id}`}
          defaults={member}
          includePassword
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

function WaiterFormFields({
  idPrefix,
  defaults,
  includePassword,
  requiredPassword,
}: {
  idPrefix: string;
  defaults?: StaffMember;
  includePassword?: boolean;
  requiredPassword?: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-displayName`}>Full name</Label>
        <Input
          id={`${idPrefix}-displayName`}
          name="displayName"
          defaultValue={defaults?.displayName ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="off"
          defaultValue={defaults?.email ?? ""}
          required
        />
      </div>
      {includePassword ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-password`}>
            {requiredPassword ? "Password" : "New password (optional)"}
          </Label>
          <Input
            id={`${idPrefix}-password`}
            name="password"
            type="password"
            autoComplete="new-password"
            required={requiredPassword}
            minLength={requiredPassword ? 6 : undefined}
            placeholder={requiredPassword ? undefined : "Leave blank to keep current"}
          />
        </div>
      ) : null}
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
        <p className={ok ? "text-xs text-success" : "text-xs text-destructive"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
