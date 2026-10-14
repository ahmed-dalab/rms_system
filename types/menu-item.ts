export type MenuItemRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  categoryName: string;
  sortOrder: number;
  isAvailable: boolean;
  /** Browser URL (signed Supabase URL or legacy https). */
  imageUrl: string | null;
  /** Raw Mongo value for admin forms (storage path or URL). */
  imageStorageKey?: string | null;
  createdAt: string;
  updatedAt: string;
};
