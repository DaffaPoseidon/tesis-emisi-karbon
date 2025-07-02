import { z } from "zod";

export const firstFormSchema = z
  .object({
    nama: z.string().min(2, {
      message: "Nama harus minimal 2 karakter.",
    }),
    no_hp: z.string().regex(/^62[0-9]{6,}$/, {
      message: "Nomor telepon harus diawali dengan 62 dan minimal 8 digit.",
    }),
    password: z.string().min(8, {
      message: "Kata sandi harus minimal 8 karakter.",
    }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Kata sandi tidak cocok",
    path: ["confirm_password"],
  });

export const secondFormSchema = z.object({
  nik: z
    .string()
    .min(16, "NIK harus terdiri dari 16 digit")
    .max(16, "NIK harus terdiri dari 16 digit"),
  tempat_lahir: z.string().min(2, "Tempat lahir minimal 2 karakter"),
  tanggal_lahir: z.string(),
  provinsi: z.string().min(2, "Provinsi minimal 2 karakter"),
  kota: z.string().min(2, "Kota minimal 2 karakter"),
  kecamatan: z.string().min(2, "Kecamatan minimal 2 karakter"),
  alamat: z.string().min(10, "Alamat minimal 10 karakter"),
  foto_diri: z
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
  foto_ktp: z
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

export type TFirstForm = z.infer<typeof firstFormSchema>;

export type TSecondForm = z.infer<typeof secondFormSchema>;

export type TRegisterRequest = Omit<TFirstForm, "confirm_password"> & TSecondForm;
