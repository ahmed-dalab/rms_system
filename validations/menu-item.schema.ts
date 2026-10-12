import { z } from "zod";

export const menuItemFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(999999, "Price is too large"),
  categoryId: z.string().min(1, "Select a category"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isAvailable: z.coerce.boolean().default(true),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("")),
});

export function parseMenuItemImageUrl(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type MenuItemFormInput = z.infer<typeof menuItemFormSchema>;

export const menuItemIdSchema = z.object({
  id: z.string().min(1),
});
