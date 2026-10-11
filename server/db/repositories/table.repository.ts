import { connectMongo } from "@/lib/mongodb/client";
import {
  TableModel,
  type TableDocument,
} from "@/server/db/models/table.model";
import type { TableRecord } from "@/types/table";

function toTableRecord(doc: TableDocument): TableRecord {
  return {
    id: doc._id.toString(),
    label: doc.label,
    capacity: doc.capacity ?? 2,
    isActive: doc.isActive ?? true,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function listTables(): Promise<TableRecord[]> {
  await connectMongo();
  const docs = await TableModel.find()
    .sort({ label: 1 })
    .lean<TableDocument[]>();
  return docs.map(toTableRecord);
}

export async function listActiveTables(): Promise<TableRecord[]> {
  await connectMongo();
  const docs = await TableModel.find({ isActive: true })
    .sort({ label: 1 })
    .lean<TableDocument[]>();
  return docs.map(toTableRecord);
}

export async function createTable(input: {
  label: string;
  capacity: number;
  isActive: boolean;
}): Promise<TableRecord> {
  await connectMongo();
  const doc = await TableModel.create(input);
  return toTableRecord(doc);
}

export async function updateTable(
  id: string,
  input: Partial<{ label: string; capacity: number; isActive: boolean }>,
): Promise<TableRecord | null> {
  await connectMongo();
  const doc = await TableModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true },
  ).lean<TableDocument>();
  return doc ? toTableRecord(doc) : null;
}

export async function deleteTable(id: string): Promise<boolean> {
  await connectMongo();
  const result = await TableModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function findTableById(id: string): Promise<TableRecord | null> {
  await connectMongo();
  const doc = await TableModel.findById(id).lean<TableDocument>();
  return doc ? toTableRecord(doc) : null;
}
