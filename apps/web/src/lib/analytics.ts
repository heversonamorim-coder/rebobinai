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
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
  }
}

/**
 * Encaminha um evento pro GA4 via gtag (a função é definida no layout quando
 * NEXT_PUBLIC_GA_ID existe). No-op sem GA_ID ou fora do browser.
 */
function gtagEvent(name: string, props?: Record<string, unknown>): void {
  if (GA_ID && typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, props ?? {});
  }
}

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

/** Evento de produto (ex.: começou a criar, concluiu, etc.). Vai pro PostHog + GA4. */
export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (POSTHOG_KEY) posthog.capture(name, props);
  gtagEvent(name, props);
}

/**
 * Passos do funil de criação (/criar), na ordem do wizard. Cada nome vira um
 * evento no GA4 e um passo no "Funnel exploration". São fixos e sem acento
 * (exigência do GA4) — não reordene nem renomeie sem ajustar o funil montado
 * no GA4. O índice do array corresponde ao `step` do wizard.
 */
export const CRIAR_FUNNEL_EVENTS = [
  'criar_etapa_1_ocasiao',
  'criar_etapa_2_historia',
  'criar_etapa_3_numeros',
  'criar_etapa_4_fotos',
  'criar_etapa_5_linha_do_tempo',
  'criar_etapa_6_trilha',
  'criar_etapa_7_capriche',
  'criar_etapa_8_finalizar',
] as const;

/**
 * Dispara o evento do passo atual do funil de criação (GA4 + PostHog). Chamado
 * a cada mudança de passo — é o que permite ver "onde o cliente parou".
 */
export function trackCriarStep(index: number): void {
  const name = CRIAR_FUNNEL_EVENTS[index];
  if (!name) return;
  trackEvent(name, { funnel: 'criar', step_index: index + 1, step_name: name });
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
