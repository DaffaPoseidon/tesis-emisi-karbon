import { z } from "zod";
export const CreateProjectReportValidation = z.object({
  body: z.object({
    id_projek: z.string(),
    judul: z.string(),
    jenis_laporan: z.enum(["UNTUNG", "RUGI"]),
    nominal: z.coerce.string(),
    modal: z.coerce.string(),
  }),
});
