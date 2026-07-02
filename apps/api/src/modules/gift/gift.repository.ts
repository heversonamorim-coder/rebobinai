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

  addAsset(data: Prisma.GiftAssetUncheckedCreateInput) {
    return this.prisma.giftAsset.create({ data });
  }

  removeAsset(giftId: string, assetId: string) {
    return this.prisma.giftAsset.deleteMany({ where: { id: assetId, giftId } });
  }
}
