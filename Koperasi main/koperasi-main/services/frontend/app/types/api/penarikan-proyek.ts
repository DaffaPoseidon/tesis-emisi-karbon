import { z } from "zod";

export const penarikanProyekSchema = z.object({
  id: z
    .number({
      required_error: "ID harus diisi",
      invalid_type_error: "ID harus berupa angka",
    })
    .optional(),
  judul: z
    .string({
      required_error: "Judul harus diisi",
      invalid_type_error: "Judul harus berupa teks",
    })
    .min(1, "Judul tidak boleh kosong"),
  user: z
    .string({
      required_error: "Pengguna harus diisi",
      invalid_type_error: "Pengguna harus berupa teks",
    })
    .min(1, "Pengguna tidak boleh kosong"),
  kategori: z
    .string({
      required_error: "Kategori harus diisi",
      invalid_type_error: "Kategori harus berupa teks",
    })
    .min(1, "Kategori tidak boleh kosong"),
  pendapatan_project: z
    .string({
      required_error: "Pendapatan proyek harus diisi",
      invalid_type_error: "Pendapatan proyek harus berupa teks",
    })
    .min(1, "Pendapatan proyek tidak boleh kosong"),
  status: z
    .string({
      required_error: "Status harus diisi",
      invalid_type_error: "Status harus berupa teks",
    })
    .min(1, "Status tidak boleh kosong"),
});

export type PenarikanProyek = z.infer<typeof penarikanProyekSchema>;
