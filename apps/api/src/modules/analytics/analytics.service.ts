import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

/**
 * Analytics de produto server-side (PostHog). Gated por POSTHOG_KEY: sem chave
 * vira no-op — o serviço fica "desligado" sem afetar o resto da app, no mesmo
 * padrão do Sentry e do PostHog do apps/web.
 *
 * É o ponto central pra contar uso por usuário (ex.: quantas pessoas distintas
 * usaram a IA). O `distinctId` é a âncora de identidade — no fluxo guest usamos
 * o hash do IP, o mesmo já usado na cota anti-abuso.
 */
@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly client?: PostHog;

  constructor(config: ConfigService) {
    const key = config.get<string>('POSTHOG_KEY');
    const host = config.get<string>('POSTHOG_HOST') ?? 'https://us.i.posthog.com';
    if (key) {
      // flushAt: 1 → envia cada evento na hora. Volume é baixíssimo (teto de
      // gerações/IP/dia), então a contagem fica confiável mesmo se o processo cair.
      this.client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
    }
  }

  get enabled(): boolean {
    return Boolean(this.client);
  }

  /**
   * Registra um evento de produto. Nunca lança — observabilidade não pode
   * derrubar o fluxo principal.
   */
  capture(distinctId: string, event: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    try {
      this.client.capture({ distinctId, event, properties });
    } catch (e) {
      this.logger.warn(`PostHog capture falhou: ${e instanceof Error ? e.message : e}`);
    }
  }

  /** Flush pendente no encerramento gracioso (SIGTERM via enableShutdownHooks). */
  async onModuleDestroy() {
    await this.client?.shutdown().catch(() => undefined);
  }
}
