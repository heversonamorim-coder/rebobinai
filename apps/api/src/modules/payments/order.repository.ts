import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

/** Único ponto que toca a tabela Order (bounded context payments). */
@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.OrderUncheckedCreateInput) {
    return this.prisma.order.create({ data });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  findByGatewayId(gatewayId: string) {
    return this.prisma.order.findFirst({ where: { gatewayId } });
  }

  /**
   * Pix pendente reaproveitável da mesma rebobinada (mesmo plano/valor). Deixa o
   * "gerar Pix" idempotente: cliques repetidos reusam o mesmo pedido e QR em vez
   * de criar pedidos/cobranças duplicados.
   */
  findReusablePix(giftId: string, planKey: $Enums.PlanKey, amountCharged: number) {
    return this.prisma.order.findFirst({
      where: {
        giftId,
        status: 'pending',
        billingType: 'PIX',
        planKey,
        amountCharged,
        gatewayId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({ where: { id }, data });
  }
}
