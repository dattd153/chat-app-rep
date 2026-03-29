import { config } from 'dotenv';
import { z } from 'zod';

// Automatically load .env file from root
config();

// Common schema used by most services
const commonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Create an extendable validation function
export const validateEnv = <T extends z.ZodRawShape>(schemaDefinition: T) => {
  const mergedSchema = commonEnvSchema.extend(schemaDefinition);
  
  const parsed = mergedSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 4));
    process.exit(1);
  }
  
  return parsed.data;
};

// Export pre-validated common env for simple services
export const env = validateEnv({});
