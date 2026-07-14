import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Único ponto que toca a tabela AiUsage (bounded context ai). Conta e incrementa
 * as gerações de IA por (hash do IP, dia BR) — a cota anti-abuso do compositor.
 */
@Injectable()
export class AiUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Quantas gerações esse IP já fez hoje (0 se nunca). */
  async count(ipHash: string, day: string): Promise<number> {
    const row = await this.prisma.aiUsage.findUnique({ where: { ipHash_day: { ipHash, day } } });
    return row?.count ?? 0;
  }

  /** Registra mais uma geração (upsert atômico do contador do dia). */
  increment(ipHash: string, day: string) {
    return this.prisma.aiUsage.upsert({
      where: { ipHash_day: { ipHash, day } },
      create: { ipHash, day, count: 1 },
      update: { count: { increment: 1 } },
    });
  }
}
