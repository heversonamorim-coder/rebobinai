import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ContactService } from '../contact/contact.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getProduct } from '../payments/products';

/**
 * Camada de relatório/fulfillment do admin de vendas (Tarefa 6). Lê pedidos +
 * dados do presente (join em código, sem cruzar contratos) e, ao despachar,
 * grava o rastreio e dispara o e-mail bonito pro cliente.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
    private readonly contact: ContactService,
  ) {}

  /** Mensagens do "fale conosco" (rodapé), mais recentes primeiro. */
  listMessages() {
    return this.contact.list();
  }

  /** Marca/desmarca uma mensagem como tratada. */
  setMessageHandled(id: string, handled: boolean) {
    return this.contact.setHandled(id, handled);
  }

  /** Lista as rebobinadas (gifts) criadas, mais recentes primeiro. */
  async listGifts() {
    const gifts = await this.prisma.gift.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        slug: true,
        status: true,
        occasion: true,
        payload: true,
        viewCount: true,
        createdAt: true,
        paidAt: true,
      },
    });
    return gifts.map((g) => {
      const p = g.payload as { title?: string; recipientName?: string; senderName?: string } | null;
      return {
        id: g.id,
        slug: g.slug,
        status: g.status,
        occasion: g.occasion,
        title: p?.title ?? null,
        recipientName: p?.recipientName ?? null,
        senderName: p?.senderName ?? null,
        viewCount: g.viewCount,
        createdAt: g.createdAt,
        paidAt: g.paidAt,
      };
    });
  }

  /** Lista os pedidos (mais recentes primeiro) enriquecidos pra gestão. */
  async listOrders() {
    const orders = await this.prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });

    const giftIds = [...new Set(orders.map((o) => o.giftId))];
    const gifts = await this.prisma.gift.findMany({
      where: { id: { in: giftIds } },
      select: { id: true, slug: true, payload: true },
    });
    const giftMap = new Map(gifts.map((g) => [g.id, g]));

    const photoIds = orders.map((o) => o.photoAssetId).filter((x): x is string => Boolean(x));
    const assets = photoIds.length
      ? await this.prisma.giftAsset.findMany({
          where: { id: { in: photoIds } },
          select: { id: true, r2Key: true },
        })
      : [];
    const assetMap = new Map(assets.map((a) => [a.id, a]));
    const base = (this.config.get<string>('R2_PUBLIC_BASE_URL') ?? '').replace(/\/+$/, '');

    return orders.map((o) => {
      const g = giftMap.get(o.giftId);
      const title = (g?.payload as { title?: string } | null)?.title ?? null;
      const asset = o.photoAssetId ? assetMap.get(o.photoAssetId) : undefined;
      const product = getProduct(o.productKey ?? undefined);
      return {
        id: o.id,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
        status: o.status,
        planKey: o.planKey,
        amountCharged: o.amountCharged,
        billingType: o.billingType,
        customerEmail: o.customerEmail,
        // Fulfillment do produto físico:
        productKey: o.productKey,
        productName: product?.name ?? null,
        photoUrl: asset && base ? `${base}/${asset.r2Key}` : null,
        shipping: o.shipping,
        shippingCost: o.shippingCost,
        trackingCode: o.trackingCode,
        shippedAt: o.shippedAt,
        gift: { slug: g?.slug ?? null, title },
      };
    });
  }

  /**
   * Registra o código de rastreio de um pedido físico e envia o e-mail pro
   * cliente. Falha de e-mail não derruba a gravação do rastreio.
   */
  async setTracking(orderId: string, trackingCode: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado.');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { trackingCode, shippedAt: new Date() },
    });

    if (order.customerEmail) {
      const product = getProduct(order.productKey ?? undefined);
      const gift = await this.prisma.gift.findUnique({
        where: { id: order.giftId },
        select: { payload: true },
      });
      const giftTitle = (gift?.payload as { title?: string } | null)?.title;
      try {
        await this.notifications.sendTrackingCode(order.customerEmail, {
          productName: product?.name ?? 'seu pedido',
          trackingCode,
          giftTitle,
        });
      } catch (e) {
        this.logger.error(`Falha ao enviar e-mail de rastreio: ${e instanceof Error ? e.message : e}`);
      }
    }

    return { id: updated.id, trackingCode: updated.trackingCode, shippedAt: updated.shippedAt };
  }
}
