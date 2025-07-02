import { z } from "zod";
export const PayMemberValidation = z.object({
  body: z.object({
    nama_bank: z.string(),
    no_rekening: z.string(),
    nama_pemilik_rekening: z.string(),
  }),
});
export const PayTopupValidation = z.object({
  body: z.object({
    nama_bank: z.string(),
    no_rekening: z.string(),
    nama_pemilik_rekening: z.string(),
    nominal: z.coerce.number(),
  }),
});
export const PaySimpananWajibValidation = z.object({
  body: z.object({
    nama_bank: z.string(),
    no_rekening: z.string(),
    nama_pemilik_rekening: z.string(),
    nominal: z.coerce.number(),
  }),
});
export const WithdrawSaldoValidation = z.object({
  body: z.object({
    nama_bank: z.string(),
    no_rekening: z.string(),
    nama_pemilik_rekening: z.string(),
    nominal: z.coerce.number(),
  }),
});
