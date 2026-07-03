import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ExampleService } from './example.service';

/** Galeria de exemplos por persona + clonagem (F2-5). Público. */
@Controller('examples')
export class ExamplesController {
  constructor(private readonly examples: ExampleService) {}

  @Get()
  list() {
    return this.examples.listActive();
  }

  @Post(':id/clone')
  @HttpCode(201)
  clone(@Param('id') id: string) {
    return this.examples.cloneToDraft(id);
  }
}
