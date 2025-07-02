import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  API_BASE_URL: z.string().url().min(1),
  WALLET_BASE_URL: z.string().url().min(1),
  SECRET_COOKIE_PASSWORD: z.string().min(8),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

type TEnv = z.infer<typeof envSchema>;
const env = parsedEnv.data;

export { env, type TEnv };
