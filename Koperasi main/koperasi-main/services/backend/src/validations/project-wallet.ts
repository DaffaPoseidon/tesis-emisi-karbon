import { z } from "zod";
export const TransferSaldoProjectWalletValidation = z.object({
  body: z.object({
    id_projek: z.string(),
    nominal: z.coerce.number(),
    deskripsi: z.string(),
  }),
});
