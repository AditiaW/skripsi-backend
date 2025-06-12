import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi."),
  description: z.string().min(1, "Deskripsi produk wajib diisi."),
  price: z.number().int().nonnegative("Harga harus berupa bilangan bulat dan tidak negatif."),
  quantity: z.number().int().nonnegative("Jumlah stok harus berupa bilangan bulat dan tidak negatif."),
  image: z.string().min(1, "Gambar produk wajib diisi."),
  categoryId: z.string().min(1, "ID kategori wajib diisi."),
});

export const updateProductSchema = productSchema.partial();
