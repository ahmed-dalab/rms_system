import mongoose from "mongoose";

import {
  MenuItemModel,
  type MenuItemDocument,
} from "@/server/db/models/menu-item.model";
import { CategoryModel } from "@/server/db/models/category.model";
import { withDb } from "@/server/db/with-db";
import type { MenuItemRecord } from "@/types/menu-item";

type PopulatedMenuItem = MenuItemDocument & {
  categoryId: { _id: mongoose.Types.ObjectId; name: string } | null;
};

function toMenuItemRecord(doc: PopulatedMenuItem): MenuItemRecord {
  const category =
    doc.categoryId && typeof doc.categoryId === "object"
      ? doc.categoryId
      : null;

  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? null,
    price: doc.price,
    categoryId: category?._id.toString() ?? doc.categoryId.toString(),
    categoryName: category?.name ?? "Unknown",
    sortOrder: doc.sortOrder ?? 0,
    isAvailable: doc.isAvailable ?? true,
    imageUrl: doc.imageUrl ?? null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

const categoryPopulate = {
  path: "categoryId" as const,
  select: "name",
  model: CategoryModel,
};

export async function listAvailableMenuItems(): Promise<MenuItemRecord[]> {
  return withDb(async () => {
    const docs = await MenuItemModel.find({ isAvailable: true })
      .populate(categoryPopulate)
      .sort({ sortOrder: 1, name: 1 })
      .lean<PopulatedMenuItem[]>();
    return docs.map(toMenuItemRecord);
  });
}

export async function findMenuItemsByIds(
  ids: string[],
): Promise<MenuItemRecord[]> {
  return withDb(async () => {
    const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const docs = await MenuItemModel.find({
      _id: { $in: objectIds },
      isAvailable: true,
    })
      .populate(categoryPopulate)
      .lean<PopulatedMenuItem[]>();
    return docs.map(toMenuItemRecord);
  });
}

export async function listMenuItems(): Promise<MenuItemRecord[]> {
  return withDb(async () => {
    const docs = await MenuItemModel.find()
      .populate(categoryPopulate)
      .sort({ sortOrder: 1, name: 1 })
      .lean<PopulatedMenuItem[]>();
    return docs.map(toMenuItemRecord);
  });
}

export async function countMenuItems(): Promise<number> {
  return withDb(() => MenuItemModel.countDocuments());
}

export async function createMenuItem(input: {
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  sortOrder: number;
  isAvailable: boolean;
  imageUrl: string | null;
}): Promise<MenuItemRecord> {
  return withDb(async () => {
    const doc = await MenuItemModel.create({
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      sortOrder: input.sortOrder,
      isAvailable: input.isAvailable,
      imageUrl: input.imageUrl,
    });
    const populated = await MenuItemModel.findById(doc._id)
      .populate(categoryPopulate)
      .lean<PopulatedMenuItem>();
    if (!populated) {
      throw new Error("Failed to load created menu item");
    }
    return toMenuItemRecord(populated);
  });
}

export async function updateMenuItem(
  id: string,
  input: Partial<{
    name: string;
    description: string | null;
    price: number;
    categoryId: string;
    sortOrder: number;
    isAvailable: boolean;
    imageUrl: string | null;
  }>,
): Promise<MenuItemRecord | null> {
  return withDb(async () => {
    await MenuItemModel.findByIdAndUpdate(id, { $set: input });
    const doc = await MenuItemModel.findById(id)
      .populate(categoryPopulate)
      .lean<PopulatedMenuItem>();
    return doc ? toMenuItemRecord(doc) : null;
  });
}

export async function findMenuItemById(
  id: string,
): Promise<MenuItemRecord | null> {
  return withDb(async () => {
    const doc = await MenuItemModel.findById(id)
      .populate(categoryPopulate)
      .lean<PopulatedMenuItem>();
    return doc ? toMenuItemRecord(doc) : null;
  });
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  return withDb(async () => {
    const result = await MenuItemModel.findByIdAndDelete(id);
    return Boolean(result);
  });
}

export async function categoryExists(categoryId: string): Promise<boolean> {
  return withDb(async () => {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return false;
    }
    const count = await CategoryModel.countDocuments({ _id: categoryId });
    return count > 0;
  });
}
