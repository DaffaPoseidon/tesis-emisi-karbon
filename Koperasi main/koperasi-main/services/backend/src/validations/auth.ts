import * as z from "zod";

export const RegisterValidation = z.object({
  body: z.object({
    nama: z.string(),
    no_hp: z.string().min(10),
    role: z.enum(["ADMIN", "BASIC", "PLATINUM"]).optional(),
    password: z.string().min(8),
    tempat_lahir: z.string(),
    tanggal_lahir: z.string().date(),
    provinsi: z.string(),
    kota: z.string(),
    kecamatan: z.string(),
    alamat: z.string(),
    nik: z.string().min(16),
  }),
});
