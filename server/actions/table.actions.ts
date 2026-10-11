"use server";

import { revalidatePath } from "next/cache";

import { authenticated } from "@/server/auth/authenticated";
import {
  createTable,
  deleteTable,
  updateTable,
} from "@/server/db/repositories/table.repository";
import { tableFormSchema, tableIdSchema } from "@/validations/table.schema";

const ADMIN_TABLES_PATH = "/admin/tables";

async function assertAdmin() {
  const user = await authenticated();
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

function parseActive(formData: FormData): boolean {
  return (
    formData.get("isActive") === "on" || formData.get("isActive") === "true"
  );
}

export type TableActionState = {
  ok: boolean;
  message: string;
};

export async function createTableAction(
  _prev: TableActionState | undefined,
  formData: FormData,
): Promise<TableActionState> {
  try {
    await assertAdmin();

    const parsed = tableFormSchema.safeParse({
      label: formData.get("label"),
      capacity: formData.get("capacity") ?? 2,
      isActive: parseActive(formData),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    await createTable({
      label: parsed.data.label,
      capacity: parsed.data.capacity,
      isActive: parsed.data.isActive,
    });

    revalidatePath(ADMIN_TABLES_PATH);
    revalidatePath("/waiter/pos");
    return { ok: true, message: "Table created" };
  } catch {
    return { ok: false, message: "Failed to create table (label may exist)" };
  }
}

export async function updateTableAction(
  _prev: TableActionState | undefined,
  formData: FormData,
): Promise<TableActionState> {
  try {
    await assertAdmin();

    const idResult = tableIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid table" };
    }

    const parsed = tableFormSchema.safeParse({
      label: formData.get("label"),
      capacity: formData.get("capacity") ?? 2,
      isActive: parseActive(formData),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const updated = await updateTable(idResult.data.id, {
      label: parsed.data.label,
      capacity: parsed.data.capacity,
      isActive: parsed.data.isActive,
    });

    if (!updated) {
      return { ok: false, message: "Table not found" };
    }

    revalidatePath(ADMIN_TABLES_PATH);
    revalidatePath("/waiter/pos");
    return { ok: true, message: "Table updated" };
  } catch {
    return { ok: false, message: "Failed to update table" };
  }
}

export async function deleteTableAction(
  _prev: TableActionState | undefined,
  formData: FormData,
): Promise<TableActionState> {
  try {
    await assertAdmin();

    const idResult = tableIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid table" };
    }

    const deleted = await deleteTable(idResult.data.id);
    if (!deleted) {
      return { ok: false, message: "Table not found" };
    }

    revalidatePath(ADMIN_TABLES_PATH);
    revalidatePath("/waiter/pos");
    return { ok: true, message: "Table deleted" };
  } catch {
    return { ok: false, message: "Failed to delete table" };
  }
}
