import { NextResponse } from "next/server";
import { z } from "zod";

import { isPublicAdminRegisterAllowed } from "@/lib/constants/register";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import {
  createUser,
  findUserByFirebaseUid,
} from "@/server/db/repositories/user.repository";
import { USER_ROLES } from "@/types/roles";

const bodySchema = z.object({
  idToken: z.string().min(1),
  displayName: z.string().min(2),
  role: z.enum(USER_ROLES),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { idToken, displayName, role } = bodySchema.parse(json);

    if (role === "admin" && !isPublicAdminRegisterAllowed()) {
      return NextResponse.json(
        { error: "Admin registration is disabled" },
        { status: 403 },
      );
    }

    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.email) {
      return NextResponse.json(
        { error: "Verified token is missing an email address" },
        { status: 400 },
      );
    }

    const existing = await findUserByFirebaseUid(decoded.uid);
    if (existing) {
      return NextResponse.json({ user: existing });
    }

    const user = await createUser({
      firebaseUid: decoded.uid,
      email: decoded.email,
      displayName,
      role,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: "Failed to register user profile" },
      { status: 500 },
    );
  }
}
