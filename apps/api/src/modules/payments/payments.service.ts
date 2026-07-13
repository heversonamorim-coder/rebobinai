import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, Prisma } from '@prisma/client';
import { GiftService } from '../gift/gift.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PlanService } from '../promotions/plan.service';
import { AsaasClient } from './asaas.client';
import { FreightService } from './freight.service';
import { OrderRepository } from './order.repository';
import { getProduct } from './products';
import { planHasAnalytics } from '../gift/geo';
import { StockService } from './stock.service';
import { CardCheckoutDto, FreightDto, PixCheckoutDto } from './dto/checkout.schemas';

type PlanRow = { key: $Enums.PlanKey; name: string; launchPrice: number };

interface ResolvedOrder {
  amount: number;
  description: string;
  physical: {
    productKey?: string;
    productSize?: string | null;
    photoAssetId?: string | null;
    shipping?: Prisma.InputJsonValue;
    shippingCost?: number;
  };
}

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
    private readonly freight: FreightService,
    private readonly stock: StockService,
  ) {}

  /** Barra o checkout de um produto físico esgotado (estoque desligado). */
  private async assertInStock(dto: PixCheckoutDto | CardCheckoutDto) {
    if (dto.planKey === 'quadro' && dto.product && !(await this.stock.isAvailable(dto.product))) {
      throw new ConflictException('Produto em falta no momento. Escolha outro ou tente mais tarde.');
    }
  }

  /** Cotação de frete + total do produto físico (não passa pelo gateway). */
  quoteFreight(dto: FreightDto) {
    const product = getProduct(dto.product);
    if (!product) throw new BadRequestException('Produto inválido.');
    const q = this.freight.quote(dto.cep);
    return {
      product: { key: product.key, name: product.name, price: product.price },
      cep: q.cep,
      region: q.region,
      shippingCost: q.cost,
      total: product.price + q.cost,
    };
  }

  /**
   * Resolve o valor a cobrar e os campos de fulfillment. Planos digitais usam o
   * preço do plano; o plano físico ('quadro') soma produto + frete calculado no
   * servidor (nunca confia no preço do cliente).
   */
  private resolveOrder(dto: PixCheckoutDto | CardCheckoutDto, plan: PlanRow): ResolvedOrder {
    if (plan.key !== 'quadro') {
      return { amount: plan.launchPrice, description: `Rebobinaí · ${plan.name}`, physical: {} };
    }
    const product = getProduct(dto.product);
    if (!product) throw new BadRequestException('Escolha um produto (caneca ou camiseta).');
    if (product.needsPhoto && !dto.photoAssetId) {
      throw new BadRequestException('Escolha a foto da caneca.');
    }
    if (product.needsSize && !dto.size) {
      throw new BadRequestException('Escolha o tamanho da camiseta.');
    }
    if (!dto.shipping) throw new BadRequestException('Informe o endereço de entrega.');
    const q = this.freight.quote(dto.shipping.cep);
    return {
      amount: product.price + q.cost,
      description: `Rebobinaí · ${product.name}`,
      physical: {
        productKey: product.key,
        productSize: dto.size ?? null,
        photoAssetId: dto.photoAssetId ?? null,
        shipping: dto.shipping as unknown as Prisma.InputJsonValue,
        shippingCost: q.cost,
      },
    };
  }

  async checkoutPix(dto: PixCheckoutDto) {
    const { plan } = await this.prepare(dto.giftId, dto.editToken, dto.planKey);
    await this.assertInStock(dto);
    const resolved = this.resolveOrder(dto, plan);
    const customer = await this.asaas.createCustomer(dto.customer);
    const order = await this.orders.create({
      giftId: dto.giftId,
      planKey: plan.key,
      amountCharged: resolved.amount,
      billingType: 'PIX',
      customerEmail: dto.customer.email,
      ...resolved.physical,
    });

    const payment = await this.asaas.createPixPayment({
      customer: customer.id,
      value: resolved.amount / 100,
      description: resolved.description,
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
    await this.assertInStock(dto);
    const resolved = this.resolveOrder(dto, plan);
    const customer = await this.asaas.createCustomer(dto.customer);
    const order = await this.orders.create({
      giftId: dto.giftId,
      planKey: plan.key,
      amountCharged: resolved.amount,
      billingType: 'CREDIT_CARD',
      customerEmail: dto.customer.email,
      ...resolved.physical,
    });

    const payment = await this.asaas.createCardPayment({
      customer: customer.id,
      value: resolved.amount / 100,
      description: resolved.description,
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
      await this.fulfill({
        giftId: order.giftId,
        customerEmail: order.customerEmail,
        planKey: order.planKey,
      });
    }
    return { orderId: order.id, status };
  }

  /**
   * Consulta o status de um pedido. Requer x-edit-token válido para o presente
   * associado ao pedido — impede enumeração e leitura de pedidos de terceiros.
   */
  async getOrderStatus(orderId: string, editToken?: string) {
    const order = await this.orders.findById(orderId);
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (!editToken) throw new ForbiddenException('Token de edição ausente');
    // Valida que o token pertence ao presente desse pedido.
    // getForEdit lança ForbiddenException se o token for inválido.
    await this.gifts.getForEdit(order.giftId, editToken);
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
   * Falha de e-mail não derruba o fluxo — ` pagamento já foi processado.
   */
  private async fulfill(order: { giftId: string; customerEmail: string | null; planKey: string }) {
    const gift = await this.gifts.markPaid(order.giftId, order.planKey);
    if (order.customerEmail && gift.slug) {
      const base = (this.config.get<string>('WEB_URL') ?? 'http://localhost:3000')
        .split(',')[0]
        ?.trim()
        .replace(/\/+$/, '');
      const payload = gift.payload as unknown as { title?: string } | null;
      const title = payload?.title || 'sua rebobinada';
      // Link de estatísticas só entra no e-mail se o plano incluir analytics.
      const statsUrl = planHasAnalytics(order.planKey) ? `${base}/p/${gift.slug}/stats` : undefined;
      try {
        await this.notifications.sendGiftLink(order.customerEmail, title, `${base}/p/${gift.slug}`, {
          statsUrl,
        });
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
