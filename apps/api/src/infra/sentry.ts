import * as Sentry from '@sentry/node';

/** Prefixo do `op` das operações de IA — usado pelo tracesSampler e pelos spans. */
export const AI_SPAN_OP = 'gen_ai.generate_text';

/**
 * Observabilidade da API (Sentry). Sem SENTRY_DSN vira no-op — o serviço fica
 * "desligado" até a chave ser configurada, sem afetar o resto da app. Precisa
 * ser chamado ANTES de instanciar o app Nest (padrão do SDK).
 *
 * Tracing: as operações de IA são SEMPRE amostradas (baratas e com teto natural
 * de gerações/IP/dia), enquanto o resto das rotas segue SENTRY_TRACES_SAMPLE_RATE
 * (0 por padrão → não consome a cota de spans). Assim dá pra observar latência,
 * tokens e erros da IA sem ligar tracing no site inteiro.
 */
export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;
  const restRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0);
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampler: (ctx) => {
      const op = ctx.attributes?.['sentry.op'];
      const name = typeof ctx.name === 'string' ? ctx.name : '';
      // IA: sempre captura (previsível e barato).
      if (op === AI_SPAN_OP || name.startsWith('ai.')) return 1;
      // Demais rotas: taxa configurável (0 por padrão).
      return Number.isFinite(restRate) ? restRate : 0;
    },
  });
  return true;
}

export { Sentry };
