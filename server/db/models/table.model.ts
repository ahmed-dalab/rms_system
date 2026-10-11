import { Schema, model, models, type InferSchemaType } from "mongoose";

const tableSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    capacity: {
      type: Number,
      default: 2,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export type TableDocument = InferSchemaType<typeof tableSchema> & {
  _id: Schema.Types.ObjectId;
};

export const TableModel =
  models.RestaurantTable ??
  model<TableDocument>("RestaurantTable", tableSchema);
