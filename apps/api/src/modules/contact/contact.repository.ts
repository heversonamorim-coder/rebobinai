import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Repositório do bounded context contact — único ponto que toca a tabela
 * ContactMessage. O admin lê via ContactService, nunca por Prisma direto.
 */
@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ContactMessageCreateInput) {
    return this.prisma.contactMessage.create({ data });
  }

  listRecent(take = 300) {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  setHandled(id: string, handled: boolean) {
    return this.prisma.contactMessage.update({ where: { id }, data: { handled } });
  }
}
