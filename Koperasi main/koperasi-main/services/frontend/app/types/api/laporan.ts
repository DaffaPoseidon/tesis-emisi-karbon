import { z } from "zod";
import type { Proyek } from "./proyek";

export const laporanSchema = z.object({
  id: z.string().optional(),
  judul: z.string().min(1, {
    message: "Judul laporan tidak boleh kosong",
  }),
  jenis_laporan: z.string().min(1, {
    message: "Jenis laporan tidak boleh kosong",
  }),
  nominal: z.string().min(1, {
    message: "Nominal laporan tidak boleh kosong",
  }),
  document: z
    .array(
      z.instanceof(File).refine((file) => file.size < 4 * 1024 * 1024, {
        message: "Ukuran file maksimal 4MB",
      }),
      {
        invalid_type_error: "Minimal 1 file",
        required_error: "Minimal 1 file",
      },
    )
    .min(1, {
      message: "Minimal 1 file",
    })
    .max(5, {
      message: "Maksimal 5 file",
    })
    .optional(),
  modal: z.string().min(1, {
    message: "Modal tidak boleh kosong",
  }),
});

export const laporanMutasiSchema = z.object({
  title: z.string().min(1, {
    message: "Judul laporan tidak boleh kosong",
  }),
  amount_profit: z.string().min(1, {
    message: "Nominal laporan tidak boleh kosong",
  }),
  amount_loss: z.string().min(1, {
    message: "Nominal laporan tidak boleh kosong",
  }),
  document: z
    .array(
      z.instanceof(File).refine((file) => file.size < 4 * 1024 * 1024, {
        message: "Ukuran file maksimal 4MB",
      }),
      {
        invalid_type_error: "Minimal 1 file",
        required_error: "Minimal 1 file",
      },
    )
    .min(1, {
      message: "Minimal 1 file",
    })
    .max(5, {
      message: "Maksimal 5 file",
    }),
});

export type LaporanResponse = {
  id: string;
  id_proyek: string;
  judul: string;
  jenis_laporan: string;
  nominal: number;
  laporan: string;
  project: Proyek;
};

export type TLaporanResponse = {
  id: string;
  id_projek: string;
  judul: string;
  jenis_laporan: string;
  nominal: number;
  modal: string;
  created_at: string;
};

export type LaporanByProjectResponse = {
  projectReport: TLaporanResponse[];
  canUploadReport: boolean;
  message: string;
};

export type TMutasi = {
  id: string;
  id_proyek: string;
  judul: string;
  pemasukan: number;
  pengeluaran: number;
  laporan: string;
  created_at: string;
};

export type LaporanMutasiResponse = {
  mutation: TMutasi[];
  canUploadMutation: boolean;
  message: string;
};

export type TLaporanMutasi = z.infer<typeof laporanMutasiSchema>;

export type TLaporan = z.infer<typeof laporanSchema>;
