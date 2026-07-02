import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftRepository } from './gift.repository';
import { GiftService } from './gift.service';
import { PublicGiftController } from './public-gift.controller';

/**
 * Bounded context: gift
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * Comunicação apenas por serviços internos exportados e eventos de domínio (outbox).
 * PrismaService vem do PrismaModule global; o acesso às tabelas Gift/GiftAsset
 * fica encapsulado no GiftRepository.
 */
@Module({
  controllers: [GiftController, PublicGiftController],
  providers: [GiftService, GiftRepository],
  exports: [GiftService],
})
export class GiftModule {}
