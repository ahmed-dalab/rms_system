import { connectMongo } from "@/lib/mongodb/client";
import {
  CategoryModel,
  type CategoryDocument,
} from "@/server/db/models/category.model";
import type { CategoryRecord } from "@/types/category";

function toCategoryRecord(doc: CategoryDocument): CategoryRecord {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? null,
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive ?? true,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listCategories(): Promise<CategoryRecord[]> {
  await connectMongo();
  const docs = await CategoryModel.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean<CategoryDocument[]>();
  return docs.map(toCategoryRecord);
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}): Promise<CategoryRecord> {
  await connectMongo();
  const doc = await CategoryModel.create(input);
  return toCategoryRecord(doc);
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
  }>,
): Promise<CategoryRecord | null> {
  await connectMongo();
  const doc = await CategoryModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true },
  ).lean<CategoryDocument>();
  return doc ? toCategoryRecord(doc) : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  await connectMongo();
  const result = await CategoryModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function findCategoryBySlug(
  slug: string,
  excludeId?: string,
): Promise<CategoryRecord | null> {
  await connectMongo();
  const doc = await CategoryModel.findOne({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean<CategoryDocument>();
  return doc ? toCategoryRecord(doc) : null;
}
