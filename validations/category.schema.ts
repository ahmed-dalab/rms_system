import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export const categoryIdSchema = z.object({
  id: z.string().min(1),
});
