import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import { clientIp } from '../gift/geo';
import { AiService } from './ai.service';
import { DraftInputDto, draftInputSchema } from './dto/ai.schemas';

/** Compositor de IA (F3-1): parágrafo → rascunho do presente. Público (guest). */
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('draft')
  draft(
    @Body(new ZodValidationPipe(draftInputSchema)) dto: DraftInputDto,
    @Headers('x-forwarded-for') xff: string | undefined,
    @Ip() ip: string,
  ) {
    const giftMeta = dto.giftId && dto.editToken ? { giftId: dto.giftId, editToken: dto.editToken } : undefined;
    return this.ai.draftFromText(dto.text, clientIp(xff, ip), giftMeta);
  }
}
