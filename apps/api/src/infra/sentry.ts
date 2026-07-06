import * as Sentry from '@sentry/node';

/**
 * Observabilidade da API (Sentry). Sem SENTRY_DSN vira no-op — o serviço fica
 * "desligado" até a chave ser configurada, sem afetar o resto da app. Precisa
 * ser chamado ANTES de instanciar o app Nest (padrão do SDK).
 */
export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0, // só captura de erros por enquanto (sem tracing)
  });
  return true;
}

export { Sentry };
