import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';

/**
 * Bounded context: contact (dono da tabela ContactMessage).
 * Exporta o ContactService pro AdminModule listar/marcar mensagens sem tocar a
 * tabela diretamente (regra do monólito modular).
 */
@Module({
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactService],
})
export class ContactModule {}
