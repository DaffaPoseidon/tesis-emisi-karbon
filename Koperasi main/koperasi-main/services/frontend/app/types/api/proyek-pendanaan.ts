import { z } from "zod";
import { anggotaSchema } from "./anggota";
import { proyekSchema } from "./proyek";

export const proyekPendanaanSchema = z.object({
  id: z
    .string({
      required_error: "ID proyek harus diisi",
      invalid_type_error: "ID proyek harus berupa angka",
    })
    .optional(),
  id_projek: z.string().optional(),
  project: proyekSchema.optional(),
  saldo: z.number(),
  dana_terkumpul: z.number(),
  user: anggotaSchema.optional(),
});

export const historyPendanaanSchema = z.object({
  id: z
    .string({
      required_error: "ID proyek harus diisi",
      invalid_type_error: "ID proyek harus berupa angka",
    })
    .optional(),
  project: proyekSchema.optional(),
  nominal: z.number().optional(),
  dana_tersisa: z.number().optional(),
  deskripsi: z.string().optional(),
  bukti_transfer: z
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
    .nullable(),
});

export type ProyekPendanaan = z.infer<typeof proyekPendanaanSchema>;
export type HistoryPendanaan = z.infer<typeof historyPendanaanSchema>;
