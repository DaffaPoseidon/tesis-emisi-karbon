import { z } from "zod";

export const pemilikPelaksanaSchema = z.object({
  id: z.number().optional(),
  id_wallet: z.number().optional(),
  nama: z.string(),
  nama_bank: z.string(),
  no_rekening: z.string(),
  nama_pemilik_rekening: z.string(),
  nominal: z.string(),
  status: z.string(),
  jenis: z.string(),
});

export const accTransferSchema = z.object({
  id: z.string(),
  bukti_pembayaran: z
    .array(
      z.instanceof(File).refine((file) => file.size < 4 * 1024 * 1024, {
        message: "Ukuran file maksimal 4MB",
      }),
    )
    .min(1, {
      message: "Minimal 1 file",
    })
    .max(5, {
      message: "Maksimal 5 file",
    })
    .nullable(),
});

export type PemilikPelaksanaResponse = {
  id: string;
  id_wallet: string;
  nama: string;
  nama_bank: string;
  no_rekening: string;
  nama_pemilik_rekening: string;
  nominal: number;
  jenis: string;
  bukti_pembayaran: string;
  status: string;
  created_at: string;
};
export type PemilikPelaksana = z.infer<typeof pemilikPelaksanaSchema>;
