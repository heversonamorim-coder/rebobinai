import * as Sentry from '@sentry/browser';
import posthog from 'posthog-js';

/**
 * Observabilidade do navegador: Sentry (erros) + PostHog (funil/eventos).
 * Tudo gated por env — sem chave, cada serviço vira no-op (fica "desligado"
 * até ser configurado). Só roda no cliente.
 */
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let started = false;

export function initAnalytics(): void {
  if (started || typeof window === 'undefined') return;
  started = true;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0,
    });
  }
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // controlamos manualmente na navegação SPA
    });
  }
}

/** Pageview manual (Next é SPA — a navegação não recarrega a página). */
export function trackPageview(url: string): void {
  if (POSTHOG_KEY) posthog.capture('$pageview', { $current_url: url });
}

/** Evento de produto (ex.: começou a criar, concluiu, etc.). */
export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (POSTHOG_KEY) posthog.capture(name, props);
}

/**
 * Captura um erro (ex.: falha ao criar presente) no Sentry + PostHog. É o
 * gancho central do "preciso saber quando alguém tenta criar e não consegue".
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (SENTRY_DSN) {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  }
  if (POSTHOG_KEY) {
    posthog.capture('$exception', {
      message: error instanceof Error ? error.message : String(error),
      ...context,
    });
  }
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[analytics]', error, context);
  }
}
