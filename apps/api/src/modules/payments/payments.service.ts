import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';
import { GiftService } from '../gift/gift.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PlanService } from '../promotions/plan.service';
import { AsaasClient } from './asaas.client';
import { OrderRepository } from './order.repository';
import { CardCheckoutDto, PixCheckoutDto } from './dto/checkout.schemas';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly asaas: AsaasClient,
    private readonly orders: OrderRepository,
    private readonly plans: PlanService,
    private readonly gifts: GiftService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async checkoutPix(dto: PixCheckoutDto) {
    const { plan } = await this.prepare(dto.giftId, dto.editToken, dto.planKey);
    const customer = await this.asaas.createCustomer(dto.customer);
    const order = await this.orders.create({
      giftId: dto.giftId,
      planKey: plan.key,
      amountCharged: plan.launchPrice,
      billingType: 'PIX',
      customerEmail: dto.customer.email,
    });

    const payment = await this.asaas.createPixPayment({
      customer: customer.id,
      value: plan.launchPrice / 100,
      description: `Rebobinaí · ${plan.name}`,
      externalReference: order.id,
    });
    await this.orders.update(order.id, {
      gatewayId: payment.id,
      status: mapAsaasStatus(payment.status),
    });

    const qr = await this.asaas.getPixQrCode(payment.id);
    return {
      orderId: order.id,
      status: mapAsaasStatus(payment.status),
      pix: {
        qrImage: `data:image/png;base64,${qr.encodedImage}`,
        copyPaste: qr.payload,
        expiresAt: qr.expirationDate ?? null,
      },
    };
  }

  async checkoutCard(dto: CardCheckoutDto, remoteIp: string) {
    const { plan } = await this.prepare(dto.giftId, dto.editToken, dto.planKey);
    const customer = await this.asaas.createCustomer(dto.customer);
    const order = await this.orders.create({
      giftId: dto.giftId,
      planKey: plan.key,
      amountCharged: plan.launchPrice,
      billingType: 'CREDIT_CARD',
      customerEmail: dto.customer.email,
    });

    const payment = await this.asaas.createCardPayment({
      customer: customer.id,
      value: plan.launchPrice / 100,
      description: `Rebobinaí · ${plan.name}`,
      externalReference: order.id,
      creditCard: dto.card,
      creditCardHolderInfo: {
        name: dto.customer.name,
        email: dto.customer.email,
        cpfCnpj: dto.customer.cpfCnpj,
        postalCode: dto.holder.postalCode,
        addressNumber: dto.holder.addressNumber,
        phone: dto.holder.phone,
      },
      remoteIp,
    });

    const status = mapAsaasStatus(payment.status);
    await this.orders.update(order.id, { gatewayId: payment.id, status });
    // Cartão aprovado na hora ativa o presente já; o webhook confirma de novo
    // (idempotente).
    if (status === 'paid') {
      await this.fulfill({ giftId: order.giftId, customerEmail: order.customerEmail });
    }
    return { orderId: order.id, status };
  }

  async getOrderStatus(orderId: string) {
    const order = await this.orders.findById(orderId);
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return { orderId: order.id, status: order.status };
  }

  /**
   * Webhook do Asaas (F1-6). Valida o token, e em pagamento confirmado marca o
   * pedido como pago e ativa o presente (slug + remove marca). Idempotente.
   */
  async handleAsaasWebhook(token: string | undefined, body: AsaasWebhookBody) {
    const expected = this.config.get<string>('ASAAS_WEBHOOK_TOKEN');
    if (!expected || token !== expected) {
      throw new UnauthorizedException('Token de webhook inválido');
    }

    const confirmedEvents = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'];
    if (!body?.event || !confirmedEvents.includes(body.event) || !body.payment?.id) {
      return { ok: true, ignored: true };
    }

    const order = await this.orders.findByGatewayId(body.payment.id);
    if (!order) {
      this.logger.warn(`Webhook Asaas sem pedido para payment ${body.payment.id}`);
      return { ok: true, ignored: true };
    }
    if (order.status === 'paid') return { ok: true, alreadyPaid: true };

    await this.orders.update(order.id, { status: 'paid', paidAt: new Date() });
    await this.fulfill(order);
    return { ok: true, activated: true };
  }

  /**
   * Ativa o presente (slug + remove marca) e dispara o e-mail com o link.
   * Falha de e-mail não derruba o fluxo — o pagamento já foi processado.
   */
  private async fulfill(order: { giftId: string; customerEmail: string | null }) {
    const gift = await this.gifts.markPaid(order.giftId);
    if (order.customerEmail && gift.slug) {
      const base = this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
      const payload = gift.payload as unknown as { title?: string } | null;
      const title = payload?.title || 'sua rebobinada';
      try {
        await this.notifications.sendGiftLink(order.customerEmail, title, `${base}/p/${gift.slug}`);
      } catch (e) {
        this.logger.error(`Falha ao enviar e-mail do pedido: ${e instanceof Error ? e.message : e}`);
      }
    }
    return gift;
  }

  /** Valida a posse do rascunho e resolve o plano/preço vigente. */
  private async prepare(giftId: string, editToken: string, planKey: string) {
    const gift = await this.gifts.getForEdit(giftId, editToken);
    if (gift.status === 'paid') throw new ConflictException('Presente já foi pago.');
    const plan = await this.plans.getByKey(planKey as $Enums.PlanKey);
    if (!plan || !plan.active) throw new NotFoundException('Plano indisponível.');
    return { gift, plan };
  }
}

export interface AsaasWebhookBody {
  event?: string;
  payment?: { id?: string; status?: string; externalReference?: string };
}

function mapAsaasStatus(status: string): $Enums.OrderStatus {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
    case 'RECEIVED_IN_CASH':
      return 'paid';
    case 'REFUNDED':
      return 'refunded';
    case 'OVERDUE':
      return 'failed';
    default:
      return 'pending';
  }
}
