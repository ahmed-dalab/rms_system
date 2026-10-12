import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { ApiError } from "@/server/api/api-error";
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  findUserById,
  updateUserProfile,
} from "@/server/db/repositories/user.repository";
import type { SessionUser } from "@/types/user";
import type {
  CreateWaiterInput,
  UpdateWaiterInput,
} from "@/validations/staff.schema";

function firebaseErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "auth/email-already-exists"
  ) {
    return "That email is already in use.";
  }
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "auth/invalid-email"
  ) {
    return "Enter a valid email address.";
  }
  return "Something went wrong. Try again.";
}

async function assertWaiterAccount(id: string): Promise<SessionUser> {
  const user = await findUserById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "waiter") {
    throw new ApiError(400, "Only waiter accounts can be managed here");
  }
  return user;
}

export async function createWaiterRecord(input: CreateWaiterInput): Promise<void> {
  const email = input.email.toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const adminAuth = getFirebaseAdminAuth();
  try {
    const firebaseUser = await adminAuth.createUser({
      email,
      password: input.password,
      displayName: input.displayName,
    });

    try {
      await createUser({
        firebaseUid: firebaseUser.uid,
        email,
        displayName: input.displayName,
        role: "waiter",
      });
    } catch (error) {
      await adminAuth.deleteUser(firebaseUser.uid).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, firebaseErrorMessage(error));
  }
}

export async function updateWaiterRecord(input: UpdateWaiterInput): Promise<void> {
  const newPassword = (input.password ?? "").trim();
  if (newPassword.length > 0 && newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const waiter = await assertWaiterAccount(input.id);
  const email = input.email.toLowerCase();

  if (email !== waiter.email) {
    const taken = await findUserByEmail(email);
    if (taken && taken.id !== waiter.id) {
      throw new ApiError(409, "That email is already in use.");
    }
  }

  const adminAuth = getFirebaseAdminAuth();
  const firebaseUpdate: {
    displayName: string;
    email?: string;
    password?: string;
  } = {
    displayName: input.displayName,
  };

  if (email !== waiter.email) {
    firebaseUpdate.email = email;
  }
  if (newPassword) {
    firebaseUpdate.password = newPassword;
  }

  try {
    await adminAuth.updateUser(waiter.firebaseUid, firebaseUpdate);

    const updated = await updateUserProfile(input.id, {
      displayName: input.displayName,
      email,
    });

    if (!updated) {
      throw new ApiError(500, "Failed to update profile");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, firebaseErrorMessage(error));
  }
}

export async function deleteWaiterRecord(
  id: string,
  actingAdminId: string,
): Promise<void> {
  const waiter = await assertWaiterAccount(id);

  if (waiter.id === actingAdminId) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  const adminAuth = getFirebaseAdminAuth();
  try {
    await adminAuth.deleteUser(waiter.firebaseUid);

    const deleted = await deleteUserById(waiter.id);
    if (!deleted) {
      throw new ApiError(500, "Failed to remove profile");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, firebaseErrorMessage(error));
  }
}
