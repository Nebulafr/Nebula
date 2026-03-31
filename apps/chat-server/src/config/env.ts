import { z } from 'zod';

export const envSchema = z.object({
  PORT: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .default(9001),
  NODE_ENV: z
    .enum(['development', 'test', 'production'] as const)
    .default('development'),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;
