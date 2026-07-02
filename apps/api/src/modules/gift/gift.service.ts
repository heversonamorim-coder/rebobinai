import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GiftRepository } from './gift.repository';
import { AddAssetDto, CreateGiftDto, UpdateGiftDto } from './dto/gift.schemas';

/**
 * Regras de domínio do presente. Guest-first: o rascunho é criado sem login e
 * editado com o `editToken` devolvido na criação. Só rascunhos podem ser
 * editados; ao pagar (F1-6) o presente vira paid e trava a edição.
 */
@Injectable()
export class GiftService {
  constructor(private readonly repo: GiftRepository) {}

  createDraft(dto: CreateGiftDto) {
    return this.repo.create({
      occasion: dto.occasion,
      payload: (dto.payload ?? {}) as Prisma.InputJsonValue,
    });
  }

  async getForEdit(id: string, editToken: string) {
    const gift = await this.repo.findById(id);
    if (!gift) throw new NotFoundException('Presente não encontrado');
    this.assertEditor(gift.editToken, editToken);
    return gift;
  }

  async update(id: string, editToken: string, dto: UpdateGiftDto) {
    const gift = await this.mustEdit(id, editToken);
    return this.repo.update(id, {
      occasion: dto.occasion ?? undefined,
      payload: dto.payload ? (dto.payload as Prisma.InputJsonValue) : undefined,
    });
  }

  async addAsset(id: string, editToken: string, dto: AddAssetDto) {
    await this.mustEdit(id, editToken);
    return this.repo.addAsset({
      giftId: id,
      type: dto.type,
      r2Key: dto.r2Key,
      order: dto.order ?? 0,
    });
  }

  async removeAsset(id: string, editToken: string, assetId: string) {
    await this.mustEdit(id, editToken);
    const { count } = await this.repo.removeAsset(id, assetId);
    if (count === 0) throw new NotFoundException('Asset não encontrado');
    return { removed: count };
  }

  /** Carrega o presente, valida o editor e garante que ainda é um rascunho. */
  private async mustEdit(id: string, editToken: string) {
    const gift = await this.repo.findById(id);
    if (!gift) throw new NotFoundException('Presente não encontrado');
    this.assertEditor(gift.editToken, editToken);
    if (gift.status !== 'draft') {
      throw new ForbiddenException('Presente finalizado não pode mais ser editado');
    }
    return gift;
  }

  private assertEditor(expected: string, provided: string | undefined) {
    if (!provided || provided !== expected) {
      throw new ForbiddenException('Token de edição inválido');
    }
  }
}
