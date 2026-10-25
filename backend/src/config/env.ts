import dotenv from 'dotenv';
import { z } from 'zod';

// Tests load their dedicated configuration before application imports.
if (process.env.NODE_ENV !== 'test') dotenv.config({ quiet: true });

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().refine(value => value.trim().length > 0, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const env = envSchema.parse(process.env);
