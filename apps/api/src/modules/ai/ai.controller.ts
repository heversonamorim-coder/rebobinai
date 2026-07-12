import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import { AiService } from './ai.service';
import { DraftInputDto, draftInputSchema } from './dto/ai.schemas';

/** Compositor de IA (F3-1): parágrafo → rascunho do presente. Público (guest). */
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('draft')
  draft(@Body(new ZodValidationPipe(draftInputSchema)) dto: DraftInputDto) {
    return this.ai.draftFromText(dto.text);
  }
}
