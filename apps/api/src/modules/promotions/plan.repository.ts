import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

/** Único ponto que toca a tabela Plan (bounded context promotions). */
@Injectable()
export class PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findByKey(key: $Enums.PlanKey) {
    return this.prisma.plan.findUnique({ where: { key } });
  }
}
