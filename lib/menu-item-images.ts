import { resolveMenuItemImageUrl } from "@/lib/supabase/menu-images";
import type { MenuItemRecord } from "@/types/menu-item";

export type EnrichMenuItemsOptions = {
  /** Include raw DB image value for admin forms (`imageStorageKey`). */
  includeStorageKey?: boolean;
};

export async function enrichMenuItemRecord(
  item: MenuItemRecord,
  options: EnrichMenuItemsOptions = {},
): Promise<MenuItemRecord> {
  const raw = item.imageUrl;
  const resolved = await resolveMenuItemImageUrl(raw);

  return {
    ...item,
    imageUrl: resolved,
    ...(options.includeStorageKey
      ? { imageStorageKey: raw }
      : {}),
  };
}

export async function enrichMenuItemRecords(
  items: MenuItemRecord[],
  options: EnrichMenuItemsOptions = {},
): Promise<MenuItemRecord[]> {
  return Promise.all(items.map((item) => enrichMenuItemRecord(item, options)));
}
