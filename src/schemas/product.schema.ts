import { z } from 'zod';

// Schema untuk membuat produk
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().int().nonnegative("Price must be a non-negative integer"),
  quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
  image: z.string().min(1, "Image URL is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

// Schema untuk mengupdate produk (semua field optional)
export const updateProductSchema = productSchema.partial();
