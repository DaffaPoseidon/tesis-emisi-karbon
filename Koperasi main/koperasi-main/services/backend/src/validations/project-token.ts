import { z } from "zod";
export const BuyTokenValidation = z.object({
  body: z.object({
    id_projek: z.string(),
    jumlah_token: z.coerce.number(),
  }),
});
