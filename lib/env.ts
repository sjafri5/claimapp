import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().optional(),
  CRON_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID: z.string().min(1),
  DRY_RUN: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
