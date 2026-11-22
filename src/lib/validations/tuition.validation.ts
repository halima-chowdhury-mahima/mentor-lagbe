
import { z } from "zod";

export const tuitionSchema = z.object({
  title: z.string().trim().min(5, "Title must contain at least 5 characters.").max(100),
  subject: z.string().trim().min(2, "Subject is required."),
  category: z.enum(["Academic", "Admission", "Language", "Skills"]),
  classLevel: z.string().trim().min(2, "Class or level is required."),
  description: z.string().trim().min(20, "Description must contain at least 20 characters."),
  salary: z.coerce.number().min(500, "Minimum salary is ৳500."),
  location: z.string().trim().min(2, "Location is required."),
  tuitionType: z.enum(["Home Tuition", "Online Tuition", "Both"]),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  tutorGender: z.enum(["Any", "Male", "Female"]).optional(),
  image: z.string().url("Please provide a valid image URL.").optional().or(z.literal("")),
});

export type TuitionFormValues = z.infer<typeof tuitionSchema>;
