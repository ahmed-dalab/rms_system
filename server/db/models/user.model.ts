import { Schema, model, models, type InferSchemaType } from "mongoose";

import { USER_ROLES } from "@/types/roles";

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel =
  models.User ?? model<UserDocument>("User", userSchema);
