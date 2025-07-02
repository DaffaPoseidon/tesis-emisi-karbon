import { z } from "zod";

export const fileOrUrlSchema = z.union([
  z.instanceof(File).refine((file) => file.size < 4 * 1024 * 1024, {
    message: "Ukuran file maksimal 4MB",
  }),
  z
    .string({
      required_error: "File atau URL harus diisi",
    })
    .url("Invalid URL"),
]);
