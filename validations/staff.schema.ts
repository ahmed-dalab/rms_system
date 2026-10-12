import { z } from "zod";

export const waiterIdSchema = z.object({
  id: z.string().min(1, "Invalid waiter"),
});

export const createWaiterSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateWaiterSchema = z.object({
  id: z.string().min(1, "Invalid waiter"),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().optional(),
});

export type CreateWaiterInput = z.infer<typeof createWaiterSchema>;
export type UpdateWaiterInput = z.infer<typeof updateWaiterSchema>;
