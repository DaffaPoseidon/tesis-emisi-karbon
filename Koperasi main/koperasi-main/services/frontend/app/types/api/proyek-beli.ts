import { z } from "zod";

export const proyekBeliSchema = z.object({
  nominal: z
    .number({
      required_error: "Nominal harus diisi",
    })
    .nonnegative({
      message: "Nominal harus lebih dari 0",
    }),
});

export type TProyekBeli = z.infer<typeof proyekBeliSchema>;
