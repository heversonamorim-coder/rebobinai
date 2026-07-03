import { Module } from '@nestjs/common';
import { GiftModule } from '../gift/gift.module';
import { ExampleRepository } from './example.repository';
import { ExampleService } from './example.service';
import { ExamplesController } from './examples.controller';

/**
 * Bounded context: gallery (dono da tabela Example).
 * Usa GiftService (serviço exportado) para clonar exemplos em rascunhos; não
 * toca tabelas de outros módulos.
 */
@Module({
  imports: [GiftModule],
  controllers: [ExamplesController],
  providers: [ExampleService, ExampleRepository],
  exports: [ExampleService],
})
export class GalleryModule {}
