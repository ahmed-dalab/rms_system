import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getFirebaseAdminStorage(): Storage {
  return getStorage(getAdminApp());
}

function getStorageBucketName(): string {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`
  );
}

const MENU_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const MENU_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Upload a menu item image to Firebase Storage; returns a long-lived read URL. */
export async function uploadMenuItemImage(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<string> {
  if (!MENU_IMAGE_TYPES.has(contentType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (buffer.length > MENU_IMAGE_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const ext =
    originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    ? ext
    : "jpg";
  const path = `menu-items/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const bucket = getFirebaseAdminStorage().bucket(getStorageBucketName());
  const file = bucket.file(path);

  await file.save(buffer, {
    metadata: { contentType, cacheControl: "public, max-age=31536000" },
  });

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
  });

  return url;
}
