import { z } from 'zod';

/**
 * Validação de ambiente — falha rápido no boot se algo essencial faltar.
 * Variáveis de serviços ainda não integrados (R2, Asaas, Sentry…) são opcionais
 * até a task que as consome; quando integrar, mova para obrigatória.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  WEB_URL: z.string().url().default('http://localhost:3000'),

  // Obrigatórias desde F0-3
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória (ver .env.example)'),
  REDIS_URL: z.string().min(1, 'REDIS_URL é obrigatória (ver .env.example)'),

  // Cloudflare R2 (módulo media — F3-3)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),

  // Asaas (módulo payments — F1-5/F1-6)
  ASAAS_API_KEY: z.string().optional(),
  ASAAS_WEBHOOK_TOKEN: z.string().optional(),
  ASAAS_ENV: z.enum(['sandbox', 'production']).default('sandbox'),

  // IA (módulo ai — F3-1)
  ANTHROPIC_API_KEY: z.string().optional(),

  // Observabilidade
  SENTRY_DSN: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`◄◄ Variáveis de ambiente inválidas:\n${issues}`);
  }
  return parsed.data;
}
