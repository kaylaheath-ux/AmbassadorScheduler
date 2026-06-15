import { z } from "zod";

// Validation for the user (ambassador/coordinator) create/edit form. Mirrors the
// event schema pattern. `id` is the NC State unity id and is the primary key, so
// it's editable on create but rendered read-only on edit.
export const userSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Unity ID is required")
    .max(40),
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Enter a valid email"),
  role: z.enum(["AMBASSADOR", "COORDINATOR"]),
  phone: z.string().trim().max(30),
});

export type UserFormState = {
  errors?: Record<string, string[] | undefined>;
  formError?: string;
};
