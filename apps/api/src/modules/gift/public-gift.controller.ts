import { Controller, Get, Param } from '@nestjs/common';
import { GiftService } from './gift.service';

/**
 * Leitura pública do presente por slug — alimenta o SSR de /p/:slug (F1-3).
 * Sem token: o slug só existe para presentes pagos e é a própria credencial
 * de acesso (curto e não-adivinhável).
 */
@Controller('public/gifts')
export class PublicGiftController {
  constructor(private readonly gifts: GiftService) {}

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.gifts.getPublicBySlug(slug);
  }
}
