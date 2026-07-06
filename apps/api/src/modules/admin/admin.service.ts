import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ContactService } from '../contact/contact.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getProduct, ProductKey } from '../payments/products';
import { StockService } from '../payments/stock.service';
import { ZipArchive } from 'archiver';

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
    private readonly stock: StockService,
  ) {}

  /** Mensagens do "fale conosco" (rodapé), mais recentes primeiro. */
  listMessages() {
    return this.contact.list();
  }

  /** Marca/desmarca uma mensagem como tratada. */
  setMessageHandled(id: string, handled: boolean) {
    return this.contact.setHandled(id, handled);
  }

  /** Estoque dos produtos físicos (liga/desliga a venda — Tarefa 8). */
  listStock() {
    return this.stock.list();
  }

  setStock(productKey: ProductKey, available: boolean) {
    return this.stock.setAvailable(productKey, available);
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
        productSize: o.productSize,
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

  /**
   * Plano de trabalho pra impressão (Tarefa 8): monta um ZIP com UMA pasta por
   * pedido, cada uma com os artefatos de produção. Caneca: foto do cliente + QR.
   * Camiseta: QR + tamanho (no pedido.txt). Sempre: pedido.txt com os dados do
   * destinatário pros Correios. Só entra pedido PAGO do produto pedido.
   */
  async streamWorkOrders(productKey: ProductKey, orderIds: string[], res: Response) {
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds }, productKey, status: 'paid' },
      orderBy: { createdAt: 'asc' },
    });

    const giftIds = [...new Set(orders.map((o) => o.giftId))];
    const gifts = await this.prisma.gift.findMany({
      where: { id: { in: giftIds } },
      select: { id: true, slug: true },
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

    const r2Base = (this.config.get<string>('R2_PUBLIC_BASE_URL') ?? '').replace(/\/+$/, '');
    const webRaw = (this.config.get<string>('WEB_URL') ?? 'http://localhost:3000').split(',')[0] ?? '';
    const webUrl = webRaw.trim().replace(/\/+$/, '') || 'http://localhost:3000';
    const productName = getProduct(productKey)?.name ?? productKey;

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="producao-${productKey}-${stamp}.zip"`);

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('warning', (e: Error) => this.logger.warn(`archiver: ${e.message}`));
    archive.on('error', (e: Error) => this.logger.error(`archiver: ${e.message}`));
    archive.pipe(res);

    let i = 0;
    for (const o of orders) {
      i += 1;
      const g = giftMap.get(o.giftId);
      const s = (o.shipping ?? {}) as unknown as ShippingJson;
      const folder = `${String(i).padStart(2, '0')}-${safeName(s.name)}-${o.id.slice(-6)}`;

      archive.append(buildOrderTxt(o.id, productName, o.productSize, o.paidAt, g?.slug ?? null, s, webUrl), {
        name: `${folder}/pedido.txt`,
      });

      if (g?.slug) {
        try {
          const qr = await QRCode.toBuffer(`${webUrl}/p/${g.slug}`, { width: 800, margin: 1 });
          archive.append(qr, { name: `${folder}/qrcode.png` });
        } catch (e) {
          this.logger.warn(`QR falhou p/ pedido ${o.id}: ${e instanceof Error ? e.message : e}`);
        }
      }

      if (productKey === 'caneca' && o.photoAssetId) {
        const asset = assetMap.get(o.photoAssetId);
        if (asset && r2Base) {
          try {
            const r = await fetch(`${r2Base}/${asset.r2Key}`);
            if (r.ok) {
              const buf = Buffer.from(await r.arrayBuffer());
              const ext = asset.r2Key.split('.').pop()?.slice(0, 5) || 'jpg';
              archive.append(buf, { name: `${folder}/foto.${ext}` });
            }
          } catch (e) {
            this.logger.warn(`Foto falhou p/ pedido ${o.id}: ${e instanceof Error ? e.message : e}`);
          }
        }
      }
    }

    await archive.finalize();
  }
}

interface ShippingJson {
  name?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  uf?: string;
}

/** Nome de pasta seguro (sem acentos/barras), pra não quebrar no descompactar. */
function safeName(s: string | undefined): string {
  const clean = (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40);
  return clean || 'sem-nome';
}

/** Ficha do pedido (texto) — dados do destinatário pros Correios + resumo. */
function buildOrderTxt(
  orderId: string,
  productName: string,
  size: string | null,
  paidAt: Date | null,
  slug: string | null,
  s: ShippingJson,
  webUrl: string,
): string {
  return (
    [
      `PEDIDO ${orderId}`,
      `Produto: ${productName}${size ? ` · Tamanho ${size}` : ''}`,
      `Pago em: ${paidAt ? new Date(paidAt).toLocaleString('pt-BR') : '—'}`,
      '',
      'DESTINATÁRIO (Correios):',
      `Nome: ${s.name ?? '—'}`,
      `Telefone: ${s.phone ?? '—'}`,
      `Endereço: ${s.street ?? '—'}, ${s.number ?? '—'}${s.complement ? ` - ${s.complement}` : ''}`,
      `Bairro: ${s.district ?? '—'}`,
      `Cidade/UF: ${s.city ?? '—'}/${s.uf ?? '—'}`,
      `CEP: ${s.cep ?? '—'}`,
      '',
      slug ? `Presente: ${webUrl}/p/${slug}` : 'Presente: (slug ainda não gerado)',
      'QR code: veja qrcode.png nesta pasta',
    ].join('\n') + '\n'
  );
}
