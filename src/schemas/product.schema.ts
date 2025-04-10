import { z } from 'zod';

// Schema untuk membuat product
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().int().nonnegative("Price must be a non-negative integer"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  images: z.string().min(1, "Image URL is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

// Schema untuk mengupdate product (semua field optional)
export const updateProductSchema = productSchema.partial();