import { Injectable, NotFoundException } from '@nestjs/common';
import { GiftService } from '../gift/gift.service';
import type { CreateGiftDto } from '../gift/dto/gift.schemas';
import { ExampleRepository } from './example.repository';

@Injectable()
export class ExampleService {
  constructor(
    private readonly repo: ExampleRepository,
    private readonly gifts: GiftService,
  ) {}

  listActive() {
    return this.repo.listActive();
  }

  /** "Usar como base": clona o payload do exemplo num rascunho novo (F2-5). */
  async cloneToDraft(id: string) {
    const example = await this.repo.findById(id);
    if (!example) throw new NotFoundException('Exemplo não encontrado');
    const dto: CreateGiftDto = {
      occasion: example.occasion ?? undefined,
      payload: example.payload as unknown as CreateGiftDto['payload'],
    };
    return this.gifts.createDraft(dto);
  }
}
