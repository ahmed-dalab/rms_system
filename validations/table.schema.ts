import { z } from "zod";

export const tableFormSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  capacity: z.coerce.number().int().min(1).max(50).default(2),
  isActive: z.coerce.boolean().default(true),
});

export const tableIdSchema = z.object({
  id: z.string().min(1),
});
