import { z } from "zod";

// Schema for creating a user
export const createUserSchema = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(60, { message: "Name cannot exceed 60 characters" }),
    email: z.string()
        .email({ message: "Invalid email address format" }),
    password: z.string()
        .min(5, { message: "Password must be at least 5 characters long" }),
    role: z.enum(["ADMIN", "USER"], { message: "Role must be either ADMIN or USER" }).optional()
}).strict(); 

// Schema for updating a user, all fields optional
export const updateUserSchema = createUserSchema.partial(); 