import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MediaService } from '../media/media.service';
import { GiftRepository } from './gift.repository';
import { AddAssetDto, CreateGiftDto, UpdateGiftDto } from './dto/gift.schemas';
import { generateSlug } from './slug';

/**
 * Regras de domínio do presente. Guest-first: o rascunho é criado sem login e
 * editado com o `editToken` devolvido na criação. Só rascunhos podem ser
 * editados; ao pagar (F1-6) o presente vira paid e trava a edição.
 */
@Injectable()
export class GiftService {
  constructor(
    private readonly repo: GiftRepository,
    private readonly media: MediaService,
  ) {}

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

  /**
   * Presente público por slug (página /p/:slug). Só existe quando pago — o slug
   * só é gerado ao pagar (anti-abuso). Registra a view (contador ao vivo) e
   * devolve a projeção pública, sem o editToken.
   */
  async getPublicBySlug(slug: string) {
    const gift = await this.repo.findBySlug(slug);
    if (!gift || gift.status !== 'paid') {
      throw new NotFoundException('Presente não encontrado');
    }
    const updated = await this.repo.incrementViews(slug);
    const { editToken: _omit, ...pub } = updated;
    return pub;
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

  /** Upload de foto (F3-3): otimiza + envia ao R2 e anexa como GiftAsset. */
  async uploadImageAsset(id: string, editToken: string, buffer: Buffer) {
    const gift = await this.mustEdit(id, editToken);
    const { r2Key } = await this.media.uploadImage(buffer);
    return this.repo.addAsset({
      giftId: id,
      type: 'image',
      r2Key,
      order: gift.assets.length,
    });
  }

  /**
   * Ativa o presente ao confirmar o pagamento (F1-6). Idempotente: se já está
   * pago, apenas retorna. Gera um slug único com retry em caso de colisão.
   */
  async markPaid(giftId: string) {
    const gift = await this.repo.findById(giftId);
    if (!gift) throw new NotFoundException('Presente não encontrado');
    if (gift.status === 'paid') return gift;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.repo.markPaid(giftId, generateSlug());
      } catch (e) {
        const isSlugCollision =
          e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
        if (isSlugCollision && attempt < 4) continue;
        throw e;
      }
    }
    // inatingível — o loop acima retorna ou relança
    throw new Error('Não foi possível gerar um slug único para o presente.');
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
