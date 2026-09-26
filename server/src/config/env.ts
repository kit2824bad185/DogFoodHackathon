import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('sqlite.db'),
  JWT_SECRET: z.string().default('default-unsafe-secret-for-dev'),
});

export const env = envSchema.parse(process.env);
