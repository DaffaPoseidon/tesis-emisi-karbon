import { z } from "zod";
import type { AnggotaResponse } from "./anggota";

export const topUpSchema = z.object({
  id: z
    .number({
      required_error: "ID harus diisi",
      invalid_type_error: "ID harus berupa angka",
    })
    .optional(),
  tanggal: z.string({
    required_error: "Tanggal harus diisi",
    invalid_type_error: "Tanggal harus berupa text",
  }),
  nama: z.string({
    required_error: "Nama harus diisi",
    invalid_type_error: "Nama harus berupa text",
  }),
  nominal: z.union([z.string(), z.number()], {
    required_error: "Nominal harus diisi",
    invalid_type_error: "Nominal harus berupa text atau angka",
  }),
  bank: z.string({
    required_error: "Bank harus diisi",
    invalid_type_error: "Bank harus berupa text",
  }),
  kategori: z.string({
    required_error: "Kategori harus diisi",
    invalid_type_error: "Kategori harus berupa text",
  }),
  status: z.string({
    required_error: "Status harus diisi",
    invalid_type_error: "Status harus berupa text",
  }),
  jenis_topup: z.string({
    required_error: "Jenis top up harus diisi",
    invalid_type_error: "Jenis top up harus berupa text",
  }),
});

export const accWithdrawSchema = z.object({
  id: z.string().optional(),
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

export const payBagianPemilikPelaksanaSchema = z.object({
  id: z.string().optional(),
  no_rekening: z
    .string()
    .min(10, {
      message: "Nomor rekening minimal 10 karakter",
    })
    .max(16, {
      message: "Nomor rekening maksimal 16 karakter",
    }),
  nama_pemilik_rekening: z
    .string()
    .min(3, {
      message: "Nama pemilik rekening minimal 3 karakter",
    })
    .max(255, {
      message: "Nama pemilik rekening maksimal 255 karakter",
    }),
  nama_bank: z
    .string()
    .min(3, {
      message: "Nama bank minimal 3 karakter",
    })
    .max(255, {
      message: "Nama bank maksimal 255 karakter",
    }),
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

export type TopUpResponse = {
  topup: {
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
  wallet: {
    id: string;
    id_user: string;
    saldo: number;
  };
  user: AnggotaResponse;
};

export type SumResponse = {
  message: string;
  total: string;
};
export type TopUp = z.infer<typeof topUpSchema>;
export type AccWithdraw = z.infer<typeof accWithdrawSchema>;
export type PayBagianPemilikPelaksana = z.infer<typeof payBagianPemilikPelaksanaSchema>;
