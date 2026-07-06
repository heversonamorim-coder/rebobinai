import { Controller, Get, Headers, HttpCode, Ip, Param, Post } from '@nestjs/common';
import { GiftService } from './gift.service';
import { clientIp } from './geo';

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

  /** Beacon do navegador: registra o acesso com o IP real do visitante. */
  @Post(':slug/view')
  @HttpCode(202)
  recordView(
    @Param('slug') slug: string,
    @Headers('x-forwarded-for') xff: string | undefined,
    @Ip() ip: string,
  ) {
    return this.gifts.recordView(slug, clientIp(xff, ip));
  }

  /** Estatísticas do presente (analytics) — gated por plano no serviço. */
  @Get(':slug/stats')
  stats(@Param('slug') slug: string) {
    return this.gifts.getStats(slug);
  }
}
