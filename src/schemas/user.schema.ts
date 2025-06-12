import { z } from "zod";

// Schema for creating a user
export const createUserSchema = z.object({
    name: z.string()
        .min(2, { message: "Nama harus terdiri dari minimal 2 karakter." })
        .max(60, { message: "Nama tidak boleh lebih dari 60 karakter." }),
    email: z.string()
        .email({ message: "Format alamat email tidak valid." }),
    password: z.string()
        .min(5, { message: "Kata sandi harus terdiri dari minimal 5 karakter." }),
    role: z.enum(["ADMIN", "USER"], {
        message: "Peran harus bernilai ADMIN atau USER.",
    }).optional(),
}).strict();

// Schema for updating a user, all fields optional
export const updateUserSchema = createUserSchema.partial(); 