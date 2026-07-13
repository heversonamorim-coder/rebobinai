import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ExampleService } from './example.service';

/** Galeria de exemplos por persona + clonagem (F2-5). Público. */
@Controller('examples')
export class ExamplesController {
  constructor(private readonly examples: ExampleService) {}

  @Get()
  list() {
    return this.examples.listActive();
  }

  /** Limite de 10 req/min: previne clonagem massiva de exemplos. */
  @Post(':id/clone')
  @HttpCode(201)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  clone(@Param('id') id: string) {
    return this.examples.cloneToDraft(id);
  }
}
