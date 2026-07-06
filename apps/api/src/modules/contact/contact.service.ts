import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ContactRepository } from './contact.repository';
import { CreateContactDto } from './dto/contact.schemas';

/**
 * Regras do "fale conosco". Guest-first: qualquer visitante envia sem login; a
 * mensagem fica salva pra leitura no admin. O admin lista e marca como tratada.
 */
@Injectable()
export class ContactService {
  constructor(private readonly repo: ContactRepository) {}

  async create(dto: CreateContactDto) {
    await this.repo.create(dto as Prisma.ContactMessageCreateInput);
    return { ok: true as const };
  }

  list() {
    return this.repo.listRecent();
  }

  async setHandled(id: string, handled: boolean) {
    try {
      return await this.repo.setHandled(id, handled);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Mensagem não encontrada');
      }
      throw e;
    }
  }
}
