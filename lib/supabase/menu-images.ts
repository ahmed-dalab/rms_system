import { getMenuImagesBucket, getSupabaseAdmin } from "@/lib/supabase/server";

const MENU_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const MENU_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Signed URL lifetime for private bucket reads (1 year). */
const SIGNED_URL_EXPIRY_SEC = 60 * 60 * 24 * 365;

const MENU_ITEM_PATH_PREFIX = "menu-items/";

export function isMenuImageStoragePath(value: string): boolean {
  return (
    value.startsWith(MENU_ITEM_PATH_PREFIX) &&
    !value.includes("..") &&
    /^menu-items\/[\w.-]+$/.test(value)
  );
}

export async function createSignedMenuImageUrl(
  storagePath: string,
): Promise<string | null> {
  if (!isMenuImageStoragePath(storagePath)) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(getMenuImagesBucket())
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SEC);

  if (error || !data?.signedUrl) {
    console.error("[supabase/menu-images] createSignedUrl", error);
    return null;
  }

  return data.signedUrl;
}

/** Resolves a DB value (storage path or legacy https URL) to a browser URL. */
export async function resolveMenuItemImageUrl(
  stored: string | null,
): Promise<string | null> {
  if (!stored) {
    return null;
  }
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return stored;
  }
  if (isMenuImageStoragePath(stored)) {
    return createSignedMenuImageUrl(stored);
  }
  return null;
}

export type MenuImageUploadResult = {
  path: string;
  url: string;
};

/** Upload to a private Supabase bucket; returns storage path + signed preview URL. */
export async function uploadMenuItemImage(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<MenuImageUploadResult> {
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
  const path = `${MENU_ITEM_PATH_PREFIX}${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from(getMenuImagesBucket())
    .upload(path, buffer, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Failed to upload image");
  }

  const url = await createSignedMenuImageUrl(path);
  if (!url) {
    throw new Error("Upload succeeded but failed to create image URL");
  }

  return { path, url };
}
