import { z } from "zod";

export const resetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .toLowerCase()
    .refine((email) => email.includes("@"), "Invalid email format"),
});
export const resetPassSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type ResetFormData = z.infer<typeof resetSchema>;
export type ResetPassFormData = z.infer<typeof resetPassSchema>;
