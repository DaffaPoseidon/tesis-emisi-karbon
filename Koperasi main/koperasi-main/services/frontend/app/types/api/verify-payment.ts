import { z } from "zod";

export const verifyPaymentSchema = z.object({
  id_proyek: z.string().optional(),
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
    .nullable()
    .optional(),
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
  bukti_transfer: z
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
  nominal: z.string().optional(),
  deskripsi: z.string().optional(),
});

export type TVerifyPayment = z.infer<typeof verifyPaymentSchema>;
