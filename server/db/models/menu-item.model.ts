import { Schema, model, models, type InferSchemaType } from "mongoose";

const menuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export type MenuItemDocument = InferSchemaType<typeof menuItemSchema> & {
  _id: Schema.Types.ObjectId;
};

export const MenuItemModel =
  models.MenuItem ?? model<MenuItemDocument>("MenuItem", menuItemSchema);
