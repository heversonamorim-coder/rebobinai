import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/**
 * Bounded context: analytics
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * Comunicação apenas por serviços internos exportados e eventos de domínio (outbox).
 *
 * Exporta o AnalyticsService (PostHog server-side) para outros módulos emitirem
 * eventos de produto — ex.: o módulo ai conta as gerações por usuário.
 */
@Module({
  imports: [],
  controllers: [],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
