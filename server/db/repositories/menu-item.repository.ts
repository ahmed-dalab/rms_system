import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb/client";
import {
  MenuItemModel,
  type MenuItemDocument,
} from "@/server/db/models/menu-item.model";
import { CategoryModel } from "@/server/db/models/category.model";
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
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function listAvailableMenuItems(): Promise<MenuItemRecord[]> {
  await connectMongo();
  const docs = await MenuItemModel.find({ isAvailable: true })
    .populate({ path: "categoryId", select: "name", model: CategoryModel })
    .sort({ sortOrder: 1, name: 1 })
    .lean<PopulatedMenuItem[]>();
  return docs.map(toMenuItemRecord);
}

export async function findMenuItemsByIds(
  ids: string[],
): Promise<MenuItemRecord[]> {
  await connectMongo();
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const docs = await MenuItemModel.find({
    _id: { $in: objectIds },
    isAvailable: true,
  })
    .populate({ path: "categoryId", select: "name", model: CategoryModel })
    .lean<PopulatedMenuItem[]>();
  return docs.map(toMenuItemRecord);
}

export async function listMenuItems(): Promise<MenuItemRecord[]> {
  await connectMongo();
  const docs = await MenuItemModel.find()
    .populate({ path: "categoryId", select: "name", model: CategoryModel })
    .sort({ sortOrder: 1, name: 1 })
    .lean<PopulatedMenuItem[]>();
  return docs.map(toMenuItemRecord);
}

export async function countMenuItems(): Promise<number> {
  await connectMongo();
  return MenuItemModel.countDocuments();
}

export async function createMenuItem(input: {
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  sortOrder: number;
  isAvailable: boolean;
}): Promise<MenuItemRecord> {
  await connectMongo();
  const doc = await MenuItemModel.create({
    name: input.name,
    description: input.description,
    price: input.price,
    categoryId: input.categoryId,
    sortOrder: input.sortOrder,
    isAvailable: input.isAvailable,
  });
  const populated = await MenuItemModel.findById(doc._id)
    .populate({ path: "categoryId", select: "name", model: CategoryModel })
    .lean<PopulatedMenuItem>();
  if (!populated) {
    throw new Error("Failed to load created menu item");
  }
  return toMenuItemRecord(populated);
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
  }>,
): Promise<MenuItemRecord | null> {
  await connectMongo();
  await MenuItemModel.findByIdAndUpdate(id, { $set: input });
  const doc = await MenuItemModel.findById(id)
    .populate({ path: "categoryId", select: "name", model: CategoryModel })
    .lean<PopulatedMenuItem>();
  return doc ? toMenuItemRecord(doc) : null;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  await connectMongo();
  const result = await MenuItemModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function categoryExists(categoryId: string): Promise<boolean> {
  await connectMongo();
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return false;
  }
  const count = await CategoryModel.countDocuments({ _id: categoryId });
  return count > 0;
}
