import { Module } from '@nestjs/common';

/**
 * Bounded context: analytics
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * Comunicação apenas por serviços internos exportados e eventos de domínio (outbox).
 */
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class AnalyticsModule {}
