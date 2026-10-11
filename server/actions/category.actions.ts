"use server";

import { revalidatePath } from "next/cache";

import { authenticated } from "@/server/auth/authenticated";
import {
  createCategory,
  deleteCategory,
  findCategoryBySlug,
  slugifyCategoryName,
  updateCategory,
} from "@/server/db/repositories/category.repository";
import {
  categoryFormSchema,
  categoryIdSchema,
} from "@/validations/category.schema";

const ADMIN_CATEGORY_PATH = "/admin/categories";

async function assertAdmin() {
  const user = await authenticated();
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

export type CategoryActionState = {
  ok: boolean;
  message: string;
};

export async function createCategoryAction(
  _prev: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await assertAdmin();

    const parsed = categoryFormSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
      sortOrder: formData.get("sortOrder") ?? 0,
      isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const baseSlug = slugifyCategoryName(parsed.data.name);
    if (!baseSlug) {
      return { ok: false, message: "Could not generate a valid slug" };
    }

    let slug = baseSlug;
    let suffix = 1;
    while (await findCategoryBySlug(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    await createCategory({
      name: parsed.data.name,
      slug,
      description: parsed.data.description?.trim() || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });

    revalidatePath(ADMIN_CATEGORY_PATH);
    revalidatePath("/admin");
    return { ok: true, message: "Category created" };
  } catch {
    return { ok: false, message: "Failed to create category" };
  }
}

export async function updateCategoryAction(
  _prev: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await assertAdmin();

    const idResult = categoryIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid category" };
    }

    const parsed = categoryFormSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
      sortOrder: formData.get("sortOrder") ?? 0,
      isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const slug = slugifyCategoryName(parsed.data.name);
    const slugTaken = await findCategoryBySlug(slug, idResult.data.id);
    if (slugTaken) {
      return { ok: false, message: "Another category already uses this name" };
    }

    const updated = await updateCategory(idResult.data.id, {
      name: parsed.data.name,
      slug,
      description: parsed.data.description?.trim() || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });

    if (!updated) {
      return { ok: false, message: "Category not found" };
    }

    revalidatePath(ADMIN_CATEGORY_PATH);
    return { ok: true, message: "Category updated" };
  } catch {
    return { ok: false, message: "Failed to update category" };
  }
}

export async function deleteCategoryAction(
  _prev: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await assertAdmin();

    const idResult = categoryIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid category" };
    }

    const deleted = await deleteCategory(idResult.data.id);
    if (!deleted) {
      return { ok: false, message: "Category not found" };
    }

    revalidatePath(ADMIN_CATEGORY_PATH);
    revalidatePath("/admin");
    return { ok: true, message: "Category deleted" };
  } catch {
    return { ok: false, message: "Failed to delete category" };
  }
}
