import * as z from "zod";

export const CreateMutationValidation = z.object({
  body: z.object({
    id_projek: z.string(),
    judul: z.string(),
    pemasukan: z.coerce.number(),
    pengeluaran: z.coerce.number(),
  }),
});
