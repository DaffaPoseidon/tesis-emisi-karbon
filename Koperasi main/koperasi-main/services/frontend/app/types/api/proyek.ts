import { z } from "zod";
import { anggotaSchema } from "./anggota";
import { kategoriSchema } from "./kategori";

export const proyekSchema = z.object({
  id: z
    .string({
      required_error: "ID proyek harus diisi",
      invalid_type_error: "ID proyek harus berupa angka",
    })
    .optional(),
  user: anggotaSchema.optional(),
  kategori: kategoriSchema.optional(),
  judul: z
    .string({
      required_error: "Judul proyek harus diisi",
      invalid_type_error: "Judul proyek harus berupa teks",
    })
    .min(1, {
      message: "Judul proyek harus diisi",
    }),
  deskripsi: z
    .string({
      required_error: "Deskripsi proyek harus diisi",
      invalid_type_error: "Deskripsi proyek harus berupa teks",
    })
    .min(1, {
      message: "Deskripsi proyek harus diisi",
    }),
  dokumenTambahan: z
    .array(z.object({ id: z.string(), dokumen: z.string(), id_proyek: z.string() }))
    .optional(),
  dokumen: z
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
  nominal: z
    .string({
      required_error: "Nominal proyek harus diisi",
      invalid_type_error: "Nominal proyek harus berupa angka",
    })
    .min(1, {
      message: "Nominal proyek harus diisi",
    }),
  asset_jaminan: z
    .string({
      required_error: "Asset jaminan harus diisi",
      invalid_type_error: "Asset jaminan harus berupa teks",
    })
    .min(1, {
      message: "Asset jaminan harus diisi",
    }),
  nilai_jaminan: z
    .string({
      required_error: "Nilai jaminan harus diisi",
      invalid_type_error: "Nilai jaminan harus berupa angka",
    })
    .min(1, {
      message: "Nilai jaminan harus diisi",
    }),
  lokasi_usaha: z
    .string({
      required_error: "Lokasi usaha harus diisi",
      invalid_type_error: "Lokasi usaha harus berupa teks",
    })
    .min(1, {
      message: "Lokasi usaha harus diisi",
    }),
  detail_lokasi: z
    .string({
      required_error: "Detail lokasi harus diisi",
      invalid_type_error: "Detail lokasi harus berupa teks",
    })
    .min(1, {
      message: "Detail lokasi harus diisi",
    }),
  brosur_produk: z
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
    .nullable()
    .optional(),
  pendapatan_perbulan: z
    .string({
      required_error: "Pendapatan per bulan harus diisi",
      invalid_type_error: "Pendapatan per bulan harus berupa angka",
    })
    .min(1, {
      message: "Pendapatan per bulan harus diisi",
    }),
  pengeluaran_perbulan: z
    .string({
      required_error: "Pengeluaran per bulan harus diisi",
      invalid_type_error: "Pengeluaran per bulan harus berupa angka",
    })
    .min(1, {
      message: "Pengeluaran per bulan harus diisi",
    }),
  dokumen_proyeksi: z
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
  status: z
    .string({
      required_error: "Status proyek harus diisi",
      invalid_type_error: "Status proyek harus berupa teks",
    })
    .min(1, {
      message: "Status proyek harus diisi",
    })
    .optional(),
  nominal_disetujui: z
    .string()
    .min(1, {
      message: "Nominal disetujui harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Nominal disetujui harus lebih dari 0",
    })
    .optional(),
  harga_per_unit: z
    .string()
    .min(1, {
      message: "Harga per unit harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Harga per unit harus lebih dari 0",
    })
    .optional(),
  jumlah_koin: z
    .string()
    .min(1, {
      message: "Jumlah koin harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Jumlah koin harus lebih dari 0",
    })
    .optional(),
  minimal_pembelian: z
    .string()
    .min(1, {
      message: "Minimal pembelian harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Minimal pembelian harus lebih dari 0",
    })
    .optional(),
  maksimal_pembelian: z
    .string()
    .min(1, {
      message: "Maksimal pembelian harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Maksimal pembelian harus lebih dari 0",
    })
    .optional(),
  report_progress: z
    .string()
    .min(1, {
      message: "Report progress harus diisi",
    })
    .optional(),
  limit_siklus: z
    .string()
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Nominal pembagian harus lebih dari 0",
    })
    .optional(),
  bagian_pelaksana: z
    .string()
    .min(1, {
      message: "Nominal pembagian untuk pelaksana harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Nominal pembagian harus lebih dari 0",
    })
    .optional(),
  bagian_koperasi: z
    .string()
    .min(1, {
      message: "Nominal pembagian untuk koperasi harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Nominal pembagian harus lebih dari 0",
    })
    .optional(),
  bagian_pemilik: z
    .string()
    .min(1, {
      message: "Nominal pembagian untuk pemilik proyek harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Nominal pembagian harus lebih dari 0",
    })
    .optional(),
  bagian_pendana: z
    .string()
    .min(1, {
      message: "Nominal pembagian untuk investor/pemodal harus diisi",
    })
    .refine((val) => Number.parseFloat(val) > 0, {
      message: "Nominal pembagian harus lebih dari 0",
    })
    .optional(),
  token_count: z.string().optional(),
  total_nominal: z.string().optional(),
  persentase: z.string().optional(),
});

export const revisiSchema = z.object({
  description: z.string().min(1, {
    message: "Deskripsi revisi harus diisi",
  }),
});

export const tolakSchema = z.object({
  description: z.string().min(1, {
    message: "Deskripsi revisi harus diisi",
  }),
});

export const approveSchema = z
  .object({
    nominal_disetujui: z
      .string()
      .min(1, {
        message: "Nominal disetujui harus diisi",
      })
      .refine((val) => Number.parseFloat(val) > 0, {
        message: "Nominal disetujui harus lebih dari 0",
      }),
    harga_per_unit: z
      .string()
      .min(1, {
        message: "Harga per unit harus diisi",
      })
      .refine((val) => Number.parseFloat(val) > 0, {
        message: "Harga per unit harus lebih dari 0",
      }),
    jumlah_koin: z
      .string()
      .min(1, {
        message: "Jumlah koin harus diisi",
      })
      .refine((val) => Number.parseFloat(val) > 0, {
        message: "Jumlah koin harus lebih dari 0",
      }),
    minimal_pembelian: z
      .string()
      .min(1, {
        message: "Minimal pembelian harus diisi",
      })
      .refine((val) => Number.parseFloat(val) > 0, {
        message: "Minimal pembelian harus lebih dari 0",
      }),
    maksimal_pembelian: z
      .string()
      .min(1, {
        message: "Maksimal pembelian harus diisi",
      })
      .refine((val) => Number.parseFloat(val) > 0, {
        message: "Maksimal pembelian harus lebih dari 0",
      }),
    report_progress: z.string().min(1, {
      message: "Report progress harus diisi",
    }),
  })
  .refine(
    (data) =>
      Number.parseFloat(data.minimal_pembelian) <= Number.parseFloat(data.maksimal_pembelian),
    {
      message: "Minimal pembelian tidak boleh lebih besar dari maksimal pembelian",
      path: ["minimal_pembelian"],
    },
  );

export const publishSchema = z.object({
  id_proyek: z
    .string({
      required_error: "ID proyek harus diisi",
      invalid_type_error: "ID proyek harus berupa teks",
    })
    .optional(),
  mulai_penggalangan_dana: z.string({
    required_error: "Tanggal mulai penggalangan dana harus diisi",
    invalid_type_error: "Tanggal mulai penggalangan dana harus berupa teks",
  }),
  selesai_penggalangan_dana: z.string({
    required_error: "Tanggal selesai penggalangan dana harus diisi",
    invalid_type_error: "Tanggal selesai penggalangan dana harus berupa teks",
  }),
  dokumen_prospektus: z.instanceof(File).refine((file) => file.size < 4 * 1024 * 1024, {
    message: "Ukuran file maksimal 4MB",
  }),
});

export type TokenResponse = {
  nama: string;
  jumlah_token: string;
  total_nilai_token: string;
  token_created_at: string;
};

export type Proyek = z.infer<typeof proyekSchema>;
export type Revisi = z.infer<typeof revisiSchema>;
export type Tolak = z.infer<typeof tolakSchema>;
export type Approve = z.infer<typeof approveSchema>;
export type Publish = z.infer<typeof publishSchema>;
