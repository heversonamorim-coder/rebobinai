import { Module } from '@nestjs/common';
import { PlanRepository } from './plan.repository';
import { PlanService } from './plan.service';
import { PlansController } from './plans.controller';

/**
 * Bounded context: promotions
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * Comunicação apenas por serviços internos exportados e eventos de domínio (outbox).
 * Dono da tabela Plan (preço de lançamento tachado, F1-9); cupons/campanhas entram na Fase 2.
 */
@Module({
  controllers: [PlansController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService],
})
export class PromotionsModule {}
