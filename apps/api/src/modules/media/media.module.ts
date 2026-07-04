import { Module } from '@nestjs/common';
import { MediaService } from './media.service';

/**
 * Bounded context: media (pipeline de imagem + storage R2).
 * Expõe MediaService para outros módulos (o gift usa no upload de fotos).
 */
@Module({
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
