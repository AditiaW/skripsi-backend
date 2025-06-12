import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, "Mohon isi nama produk."),
});

export const updateCategorySchema = categorySchema.partial();