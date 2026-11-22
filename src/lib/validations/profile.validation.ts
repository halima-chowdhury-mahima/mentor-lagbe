
import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(60),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladesh phone number.")
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Address cannot exceed 200 characters.")
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
