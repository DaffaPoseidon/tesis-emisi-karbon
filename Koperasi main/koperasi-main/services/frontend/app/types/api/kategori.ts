import { z } from "zod";

export const kategoriSchema = z.object({
  id: z
    .string()
    .min(1, {
      message: "Kategori harus diisi",
    })
    .optional(),
  kategori: z
    .string({
      required_error: "Kategori harus diisi",
    })
    .optional(),
});

export type Kategori = z.infer<typeof kategoriSchema>;
