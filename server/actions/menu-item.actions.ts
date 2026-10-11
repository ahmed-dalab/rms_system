"use server";

import { revalidatePath } from "next/cache";

import { authenticated } from "@/server/auth/authenticated";
import {
  categoryExists,
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
} from "@/server/db/repositories/menu-item.repository";
import {
  menuItemFormSchema,
  menuItemIdSchema,
} from "@/validations/menu-item.schema";

const ADMIN_MENU_PATH = "/admin/menu";

async function assertAdmin() {
  const user = await authenticated();
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

function parseAvailability(formData: FormData): boolean {
  return (
    formData.get("isAvailable") === "on" ||
    formData.get("isAvailable") === "true"
  );
}

export type MenuItemActionState = {
  ok: boolean;
  message: string;
};

export async function createMenuItemAction(
  _prev: MenuItemActionState | undefined,
  formData: FormData,
): Promise<MenuItemActionState> {
  try {
    await assertAdmin();

    const parsed = menuItemFormSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
      price: formData.get("price"),
      categoryId: formData.get("categoryId"),
      sortOrder: formData.get("sortOrder") ?? 0,
      isAvailable: parseAvailability(formData),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const exists = await categoryExists(parsed.data.categoryId);
    if (!exists) {
      return { ok: false, message: "Selected category does not exist" };
    }

    await createMenuItem({
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      sortOrder: parsed.data.sortOrder,
      isAvailable: parsed.data.isAvailable,
    });

    revalidatePath(ADMIN_MENU_PATH);
    revalidatePath("/admin");
    return { ok: true, message: "Menu item created" };
  } catch {
    return { ok: false, message: "Failed to create menu item" };
  }
}

export async function updateMenuItemAction(
  _prev: MenuItemActionState | undefined,
  formData: FormData,
): Promise<MenuItemActionState> {
  try {
    await assertAdmin();

    const idResult = menuItemIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid menu item" };
    }

    const parsed = menuItemFormSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
      price: formData.get("price"),
      categoryId: formData.get("categoryId"),
      sortOrder: formData.get("sortOrder") ?? 0,
      isAvailable: parseAvailability(formData),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const exists = await categoryExists(parsed.data.categoryId);
    if (!exists) {
      return { ok: false, message: "Selected category does not exist" };
    }

    const updated = await updateMenuItem(idResult.data.id, {
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      sortOrder: parsed.data.sortOrder,
      isAvailable: parsed.data.isAvailable,
    });

    if (!updated) {
      return { ok: false, message: "Menu item not found" };
    }

    revalidatePath(ADMIN_MENU_PATH);
    return { ok: true, message: "Menu item updated" };
  } catch {
    return { ok: false, message: "Failed to update menu item" };
  }
}

export async function deleteMenuItemAction(
  _prev: MenuItemActionState | undefined,
  formData: FormData,
): Promise<MenuItemActionState> {
  try {
    await assertAdmin();

    const idResult = menuItemIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid menu item" };
    }

    const deleted = await deleteMenuItem(idResult.data.id);
    if (!deleted) {
      return { ok: false, message: "Menu item not found" };
    }

    revalidatePath(ADMIN_MENU_PATH);
    revalidatePath("/admin");
    return { ok: true, message: "Menu item deleted" };
  } catch {
    return { ok: false, message: "Failed to delete menu item" };
  }
}
