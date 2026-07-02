import { Module } from '@nestjs/common';
import { GiftModule } from '../gift/gift.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { AsaasClient } from './asaas.client';
import { AsaasWebhookController } from './asaas-webhook.controller';
import { CheckoutController } from './checkout.controller';
import { OrderRepository } from './order.repository';
import { PaymentsService } from './payments.service';

/**
 * Bounded context: payments (dono da tabela Order).
 * Comunicação entre módulos por serviços exportados: usa GiftService (ativar o
 * presente ao pagar) e PlanService (resolver o preço). Não toca tabelas alheias.
 */
@Module({
  imports: [GiftModule, PromotionsModule, NotificationsModule],
  controllers: [CheckoutController, AsaasWebhookController],
  providers: [PaymentsService, AsaasClient, OrderRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
