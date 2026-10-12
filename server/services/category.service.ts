import { ApiError } from "@/server/api/api-error";
import {
  createCategory,
  findCategoryBySlug,
  slugifyCategoryName,
  updateCategory,
} from "@/server/db/repositories/category.repository";
import type { CategoryRecord } from "@/types/category";
import type { CategoryFormInput } from "@/validations/category.schema";

async function resolveUniqueCategorySlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const baseSlug = slugifyCategoryName(name);
  if (!baseSlug) {
    throw new ApiError(400, "Could not generate a valid slug");
  }

  let slug = baseSlug;
  let suffix = 1;
  while (await findCategoryBySlug(slug, excludeId)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function toCategoryPayload(input: CategoryFormInput) {
  return {
    name: input.name,
    description: input.description?.trim() || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export async function createCategoryRecord(
  input: CategoryFormInput,
): Promise<CategoryRecord> {
  const slug = await resolveUniqueCategorySlug(input.name);
  return createCategory({
    ...toCategoryPayload(input),
    slug,
  });
}

export async function updateCategoryRecord(
  id: string,
  input: CategoryFormInput,
): Promise<CategoryRecord> {
  const slug = slugifyCategoryName(input.name);
  const slugTaken = await findCategoryBySlug(slug, id);
  if (slugTaken) {
    throw new ApiError(409, "Another category already uses this name");
  }

  const updated = await updateCategory(id, {
    ...toCategoryPayload(input),
    slug,
  });
  if (!updated) {
    throw new ApiError(404, "Category not found");
  }
  return updated;
}
