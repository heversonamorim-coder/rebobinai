import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { AsaasWebhookBody, PaymentsService } from './payments.service';

/**
 * Webhook do Asaas (F1-6). Autenticação pelo header `asaas-access-token`, que
 * deve bater com ASAAS_WEBHOOK_TOKEN (configurado no painel do Asaas).
 */
@Controller('webhooks/asaas')
export class AsaasWebhookController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  @HttpCode(200)
  handle(
    @Headers('asaas-access-token') token: string | undefined,
    @Body() body: AsaasWebhookBody,
  ) {
    return this.payments.handleAsaasWebhook(token, body);
  }
}
