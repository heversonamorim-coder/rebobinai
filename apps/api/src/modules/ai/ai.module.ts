import { Module } from '@nestjs/common';
import { GiftModule } from '../gift/gift.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiUsageRepository } from './ai-usage.repository';

/**
 * Bounded context: ai (F3-1). Texto livre → rascunho do presente via Claude.
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * A cota (AiUsage) é a sua própria tabela; a marcação composedWithAi vai pelo
 * GiftService exportado (não toca a tabela Gift diretamente).
 */
@Module({
  imports: [GiftModule],
  controllers: [AiController],
  providers: [AiService, AiUsageRepository],
  exports: [AiService],
})
export class AiModule {}
