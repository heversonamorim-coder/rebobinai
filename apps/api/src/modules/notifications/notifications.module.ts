import { Module } from '@nestjs/common';
import { EmailClient } from './email.client';
import { NotificationsService } from './notifications.service';

/**
 * Bounded context: notifications
 * Regra do monólito modular: este módulo NÃO acessa tabelas de outros módulos.
 * Comunicação apenas por serviços internos exportados e eventos de domínio (outbox).
 */
@Module({
  providers: [NotificationsService, EmailClient],
  exports: [NotificationsService],
})
export class NotificationsModule {}
