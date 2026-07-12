import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

/**
 * Bounded context: ai (F3-1). Texto livre → rascunho do presente via Claude.
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * Comunicação apenas por serviços internos exportados e eventos de domínio (outbox).
 */
@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
