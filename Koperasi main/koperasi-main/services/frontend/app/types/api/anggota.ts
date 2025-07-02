import { z } from "zod";
import { fileOrUrlSchema } from "~/utils/file-or-url-schema";

export const anggotaSchema = z.object({
  id: z.number().optional(),
  nik: z.string({
    required_error: "NIK harus diisi",
  }),
  nama: z.string({
    required_error: "Nama harus diisi",
  }),
  no_hp: z.string({
    required_error: "No. Handphone harus diisi",
  }),
  role: z.string({
    required_error: "Member harus diisi",
  }),
  status: z.string({
    required_error: "Status harus diisi",
  }),
  tempat_lahir: z.string({
    required_error: "Tempat lahir harus diisi",
  }),
  tanggal_lahir: z.string({
    required_error: "Tanggal lahir harus diisi",
  }),
  provinsi: z
    .string({
      required_error: "Provinsi harus diisi",
    })
    .optional(),
  kota: z
    .string({
      required_error: "Kabupaten harus diisi",
    })
    .optional(),
  kecamatan: z
    .string({
      required_error: "Kecamatan harus diisi",
    })
    .optional(),
  alamat: z.string({
    required_error: "Alamat harus diisi",
  }),
  foto_profile: fileOrUrlSchema.nullable().optional(),
  foto_diri: z
    .array(fileOrUrlSchema)
    .min(1, {
      message: "Minimal 1 file atau URL",
    })
    .max(1, {
      message: "Maksimal 1 file atau URL",
    })
    .nullable()
    .optional(),
  foto_ktp: fileOrUrlSchema.nullable().optional(),
  signature: z
    .array(fileOrUrlSchema)
    .min(1, {
      message: "Minimal 1 file atau URL",
    })
    .max(1, {
      message: "Maksimal 1 file atau URL",
    })
    .nullable()
    .optional(),
  created_at: z.string().optional(),
});

export type AnggotaResponse = Omit<
  z.infer<typeof anggotaSchema>,
  "foto_ktp" | "foto_diri" | "foto_profile"
> & {
  foto_profile: string | null;
  foto_ktp: string | null;
  foto_diri: string | null;
  otp: string | null;
};

export type Anggota = z.infer<typeof anggotaSchema>;
