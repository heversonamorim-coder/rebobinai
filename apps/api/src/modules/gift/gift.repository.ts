import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Repositório do bounded context gift. Único ponto que toca as tabelas Gift e
 * GiftAsset — nenhum outro módulo consulta essas tabelas diretamente.
 */
@Injectable()
export class GiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly withAssets = {
    assets: { orderBy: { order: 'asc' } as const },
  };

  create(data: Prisma.GiftCreateInput) {
    return this.prisma.gift.create({ data, include: this.withAssets });
  }

  findById(id: string) {
    return this.prisma.gift.findUnique({ where: { id }, include: this.withAssets });
  }

  findBySlug(slug: string) {
    return this.prisma.gift.findUnique({ where: { slug }, include: this.withAssets });
  }

  update(id: string, data: Prisma.GiftUpdateInput) {
    return this.prisma.gift.update({ where: { id }, data, include: this.withAssets });
  }

  /** Incremento atômico do contador de views da página pública (F1-3). */
  incrementViews(slug: string) {
    return this.prisma.gift.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      include: this.withAssets,
    });
  }

  /**
   * Ativa o presente ao pagar (F1-6): status=paid, remove marca, gera slug e
   * grava o evento gift.paid no outbox — tudo na MESMA transação.
   */
  markPaid(giftId: string, slug: string) {
    return this.prisma.$transaction(async (tx) => {
      const gift = await tx.gift.update({
        where: { id: giftId },
        data: { status: 'paid', watermark: false, slug, paidAt: new Date() },
        include: this.withAssets,
      });
      await tx.outboxEvent.create({
        data: {
          eventType: 'gift.paid',
          aggregateType: 'Gift',
          aggregateId: giftId,
          payload: { slug },
        },
      });
      return gift;
    });
  }

  addAsset(data: Prisma.GiftAssetUncheckedCreateInput) {
    return this.prisma.giftAsset.create({ data });
  }

  removeAsset(giftId: string, assetId: string) {
    return this.prisma.giftAsset.deleteMany({ where: { id: assetId, giftId } });
  }
}
