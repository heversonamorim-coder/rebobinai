import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

/** Único ponto que toca a tabela ProductStock (estoque dos produtos físicos). */
@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.productStock.findMany();
  }

  findOne(productKey: string) {
    return this.prisma.productStock.findUnique({ where: { productKey } });
  }

  upsert(productKey: string, available: boolean) {
    return this.prisma.productStock.upsert({
      where: { productKey },
      create: { productKey, available },
      update: { available },
    });
  }
}
