import { connectMongo } from "@/lib/mongodb/client";
import {
  UserModel,
  type UserDocument,
} from "@/server/db/models/user.model";
import type { UserRole } from "@/types/roles";
import type { StaffMember } from "@/types/staff";
import type { SessionUser } from "@/types/user";

function toSessionUser(doc: UserDocument): SessionUser {
  return {
    id: doc._id.toString(),
    firebaseUid: doc.firebaseUid,
    email: doc.email,
    displayName: doc.displayName ?? null,
    role: doc.role as UserRole,
  };
}

export async function findUserByFirebaseUid(
  firebaseUid: string,
): Promise<SessionUser | null> {
  await connectMongo();
  const user = await UserModel.findOne({ firebaseUid }).lean<UserDocument>();
  return user ? toSessionUser(user) : null;
}

export async function findUserByEmail(
  email: string,
): Promise<SessionUser | null> {
  await connectMongo();
  const user = await UserModel.findOne({
    email: email.toLowerCase(),
  }).lean<UserDocument>();
  return user ? toSessionUser(user) : null;
}

export async function createUser(input: {
  firebaseUid: string;
  email: string;
  displayName: string;
  role: UserRole;
}): Promise<SessionUser> {
  await connectMongo();
  const user = await UserModel.create({
    firebaseUid: input.firebaseUid,
    email: input.email.toLowerCase(),
    displayName: input.displayName,
    role: input.role,
  });
  return toSessionUser(user);
}

export async function findUserById(id: string): Promise<SessionUser | null> {
  await connectMongo();
  const user = await UserModel.findById(id).lean<UserDocument>();
  return user ? toSessionUser(user) : null;
}

export async function updateUserProfile(
  id: string,
  input: { displayName: string; email: string },
): Promise<SessionUser | null> {
  await connectMongo();
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      $set: {
        displayName: input.displayName,
        email: input.email.toLowerCase(),
      },
    },
    { new: true },
  ).lean<UserDocument>();
  return user ? toSessionUser(user) : null;
}

export async function deleteUserById(id: string): Promise<boolean> {
  await connectMongo();
  const result = await UserModel.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function listStaffMembers(): Promise<StaffMember[]> {
  await connectMongo();
  const docs = await UserModel.find()
    .sort({ role: 1, displayName: 1, email: 1 })
    .lean<UserDocument[]>();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    email: doc.email,
    displayName: doc.displayName ?? null,
    role: doc.role as UserRole,
    createdAt: new Date(doc.createdAt).toISOString(),
  }));
}
