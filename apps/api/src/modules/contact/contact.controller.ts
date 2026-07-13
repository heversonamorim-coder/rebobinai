import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import { ContactService } from './contact.service';
import { CreateContactDto, createContactSchema } from './dto/contact.schemas';

/** "Fale conosco" público (rodapé) — grava a mensagem pra leitura no admin. */
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  /** Limite de 5 req/min: previne flooding de mensagens de contato. */
  @Post()
  @HttpCode(202)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  send(@Body(new ZodValidationPipe(createContactSchema)) dto: CreateContactDto) {
    return this.contact.create(dto);
  }
}
