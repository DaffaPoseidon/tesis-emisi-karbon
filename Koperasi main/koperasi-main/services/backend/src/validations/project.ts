import { z } from "zod";
export const CreateProjectValidation = z.object({
  body: z.object({
    id_kategori: z.string(),
    judul: z.string(),
    deskripsi: z.string(),
    nominal: z.coerce.number(),
    asset_jaminan: z.string(),
    nilai_jaminan: z.coerce.number(),
    lokasi_usaha: z.string(),
    detail_lokasi: z.string(),
    pendapatan_perbulan: z.coerce.number(),
    pengeluaran_perbulan: z.coerce.number(),
    limit_siklus: z.coerce.number(),
    bagian_pelaksana: z.coerce.number(),
    bagian_koperasi: z.coerce.number(),
    bagian_pemilik: z.coerce.number(),  
    bagian_pendana: z.coerce.number(),
  }),
});

export const UpdateProjectValidation = z.object({
  body: z.object({
    judul: z.string().optional(),
    deskripsi: z.string().optional(),
    nominal: z.coerce.number().optional(),
    asset_jaminan: z.string().optional(),
    nilai_jaminan: z.coerce.number().optional(),
    lokasi_usaha: z.string().optional(),
    detail_lokasi: z.string().optional(),
    pendapatan_perbulan: z.coerce.number().optional(),
    pengeluaran_perbulan: z.coerce.number().optional(),
    limit_siklus: z.coerce.number().optional(),
    bagian_pelaksana: z.coerce.number().optional(),
    bagian_koperasi: z.coerce.number().optional(),
    bagian_pemilik: z.coerce.number().optional(),  
    bagian_pendana: z.coerce.number().optional(),
  }),
});
