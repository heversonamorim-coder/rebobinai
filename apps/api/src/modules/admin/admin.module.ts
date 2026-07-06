import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

/**
 * Admin de vendas (Tarefa 6). Camada de relatório/fulfillment: lê pedidos e
 * grava rastreio, disparando o e-mail via NotificationsService. Lê mensagens do
 * "fale conosco" (ContactService) e controla o estoque (StockService, Tarefa 8).
 * PrismaService vem do módulo global. Protegido por token (AdminGuard).
 */
@Module({
  imports: [NotificationsModule, ContactModule, PaymentsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
