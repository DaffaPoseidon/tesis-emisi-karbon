import { z } from "zod";
export const UpgradePlatinumValidation = z.object({
  body: z.object({
    nama_bank: z.string(),
    no_rekening: z.string(),
    nama_pemilik_rekening: z.string(),
    nominal: z.coerce.number(),
  }),
});