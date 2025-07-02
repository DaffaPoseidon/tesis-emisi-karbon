import { z } from "zod";
export const CreateProjectCategoryValidation = z.object({
  body: z.object({
    kategori: z.string(),
  }),
});

export const UpdateProjectCategoryValidation = z.object({
  body: z.object({
    id: z.string(),
    kategori: z.string()
  }),
});
