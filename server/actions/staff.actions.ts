"use server";

import { revalidatePath } from "next/cache";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { authenticated } from "@/server/auth/authenticated";
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  findUserById,
  updateUserProfile,
} from "@/server/db/repositories/user.repository";
import {
  createWaiterSchema,
  updateWaiterSchema,
  waiterIdSchema,
} from "@/validations/staff.schema";

const ADMIN_STAFF_PATH = "/admin/staff";

export type StaffActionState = {
  ok: boolean;
  message: string;
};

async function assertAdmin() {
  const user = await authenticated();
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

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

async function assertWaiterAccount(id: string) {
  const user = await findUserById(id);
  if (!user) {
    return { ok: false as const, message: "User not found" };
  }
  if (user.role !== "waiter") {
    return { ok: false as const, message: "Only waiter accounts can be managed here" };
  }
  return { ok: true as const, user };
}

export async function createWaiterAction(
  _prev: StaffActionState | undefined,
  formData: FormData,
): Promise<StaffActionState> {
  try {
    await assertAdmin();

    const parsed = createWaiterSchema.safeParse({
      displayName: formData.get("displayName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await findUserByEmail(email);
    if (existing) {
      return { ok: false, message: "A user with this email already exists." };
    }

    const adminAuth = getFirebaseAdminAuth();
    const firebaseUser = await adminAuth.createUser({
      email,
      password: parsed.data.password,
      displayName: parsed.data.displayName,
    });

    try {
      await createUser({
        firebaseUid: firebaseUser.uid,
        email,
        displayName: parsed.data.displayName,
        role: "waiter",
      });
    } catch (error) {
      await adminAuth.deleteUser(firebaseUser.uid).catch(() => undefined);
      throw error;
    }

    revalidatePath(ADMIN_STAFF_PATH);
    return { ok: true, message: "Waiter account created" };
  } catch (error) {
    return { ok: false, message: firebaseErrorMessage(error) };
  }
}

export async function updateWaiterAction(
  _prev: StaffActionState | undefined,
  formData: FormData,
): Promise<StaffActionState> {
  try {
    await assertAdmin();

    const parsed = updateWaiterSchema.safeParse({
      id: formData.get("id"),
      displayName: formData.get("displayName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const newPassword = (parsed.data.password ?? "").trim();
    if (newPassword.length > 0 && newPassword.length < 6) {
      return {
        ok: false,
        message: "Password must be at least 6 characters",
      };
    }

    const waiterCheck = await assertWaiterAccount(parsed.data.id);
    if (!waiterCheck.ok) {
      return { ok: false, message: waiterCheck.message };
    }

    const email = parsed.data.email.toLowerCase();
    if (email !== waiterCheck.user.email) {
      const taken = await findUserByEmail(email);
      if (taken && taken.id !== waiterCheck.user.id) {
        return { ok: false, message: "That email is already in use." };
      }
    }

    const adminAuth = getFirebaseAdminAuth();
    const firebaseUpdate: {
      displayName: string;
      email?: string;
      password?: string;
    } = {
      displayName: parsed.data.displayName,
    };

    if (email !== waiterCheck.user.email) {
      firebaseUpdate.email = email;
    }
    if (newPassword) {
      firebaseUpdate.password = newPassword;
    }

    await adminAuth.updateUser(waiterCheck.user.firebaseUid, firebaseUpdate);

    const updated = await updateUserProfile(parsed.data.id, {
      displayName: parsed.data.displayName,
      email,
    });

    if (!updated) {
      return { ok: false, message: "Failed to update profile" };
    }

    revalidatePath(ADMIN_STAFF_PATH);
    return { ok: true, message: "Waiter updated" };
  } catch (error) {
    return { ok: false, message: firebaseErrorMessage(error) };
  }
}

export async function deleteWaiterAction(
  _prev: StaffActionState | undefined,
  formData: FormData,
): Promise<StaffActionState> {
  try {
    const admin = await assertAdmin();

    const idResult = waiterIdSchema.safeParse({ id: formData.get("id") });
    if (!idResult.success) {
      return { ok: false, message: "Invalid waiter" };
    }

    const waiterCheck = await assertWaiterAccount(idResult.data.id);
    if (!waiterCheck.ok) {
      return { ok: false, message: waiterCheck.message };
    }

    if (waiterCheck.user.id === admin.id) {
      return { ok: false, message: "You cannot delete your own account." };
    }

    const adminAuth = getFirebaseAdminAuth();
    await adminAuth.deleteUser(waiterCheck.user.firebaseUid);

    const deleted = await deleteUserById(waiterCheck.user.id);
    if (!deleted) {
      return { ok: false, message: "Failed to remove profile" };
    }

    revalidatePath(ADMIN_STAFF_PATH);
    return { ok: true, message: "Waiter removed" };
  } catch (error) {
    return { ok: false, message: firebaseErrorMessage(error) };
  }
}
