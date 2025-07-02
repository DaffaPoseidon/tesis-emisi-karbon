import { z } from "zod";

export const dompetRegulerSchema = z.object({
  id: z
    .number({
      required_error: "ID harus diisi",
      invalid_type_error: "ID harus berupa angka",
    })
    .optional(),
  tanggal: z.string({
    required_error: "Tanggal harus diisi",
    invalid_type_error: "Tanggal harus berupa teks",
  }),
  bank: z.string({
    required_error: "Bank harus diisi",
    invalid_type_error: "Bank harus berupa teks",
  }),
  nominal: z.string({
    required_error: "Nominal harus diisi",
    invalid_type_error: "Nominal harus berupa teks atau angka",
  }),
  kategori: z.string({
    required_error: "Kategori harus diisi",
    invalid_type_error: "Kategori harus berupa teks",
  }),
  status: z.string({
    required_error: "Status harus diisi",
    invalid_type_error: "Status harus berupa teks",
  }),
});

export type DompetReguler = z.infer<typeof dompetRegulerSchema>;
