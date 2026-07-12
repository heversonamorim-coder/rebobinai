import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MediaService } from '../media/media.service';
import { GiftRepository } from './gift.repository';
import { AddAssetDto, CreateGiftDto, UpdateGiftDto } from './dto/gift.schemas';
import { brDay, geoLookup, hashIp, planHasAnalytics } from './geo';
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

  async createDraft(dto: CreateGiftDto) {
    const gift = await this.repo.create({
      occasion: dto.occasion,
      payload: (dto.payload ?? {}) as Prisma.InputJsonValue,
    });
    return this.withAssetUrls(gift);
  }

  async getForEdit(id: string, editToken: string) {
    const gift = await this.repo.findById(id);
    if (!gift) throw new NotFoundException('Presente não encontrado');
    this.assertEditor(gift.editToken, editToken);
    return this.withAssetUrls(gift);
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
    // A contagem de acessos é feita pelo beacon do navegador (recordView), pra
    // capturar o IP real do visitante — não a do servidor que faz o SSR.
    const { editToken: _omit, ...pub } = this.withAssetUrls(gift);
    return pub;
  }

  /**
   * Registra um acesso à página pública (analytics). Chamado pelo beacon do
   * navegador, então enxerga o IP real do visitante. Silencioso se não achar.
   */
  async recordView(slug: string, ip: string | undefined): Promise<{ ok: boolean }> {
    const gift = await this.repo.findBySlug(slug);
    if (!gift || gift.status !== 'paid') return { ok: false };
    const geo = geoLookup(ip);
    await this.repo.recordView({
      giftId: gift.id,
      ipHash: hashIp(ip, gift.id),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      lat: geo.lat,
      lon: geo.lon,
      day: brDay(),
    });
    return { ok: true };
  }

  /**
   * Estatísticas do presente (analytics) por slug. Só quando o plano pago inclui
   * o recurso; senão devolve { eligible: false } pra UI mostrar o upsell.
   */
  async getStats(slug: string) {
    const gift = await this.repo.findBySlug(slug);
    if (!gift || gift.status !== 'paid') throw new NotFoundException('Presente não encontrado');
    const title = (gift.payload as { title?: string } | null)?.title ?? null;
    if (!planHasAnalytics(gift.paidPlanKey)) {
      return { eligible: false as const, title };
    }

    const views = await this.repo.listViews(gift.id);
    const total = views.length;
    const unique = new Set(views.map((v) => v.ipHash)).size;

    // Últimos 7 dias (fuso BR): total + únicos por dia.
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) days.push(brDay(new Date(Date.now() - i * 86_400_000)));
    const daily = days.map((day) => {
      const dv = views.filter((v) => v.day === day);
      return { day, total: dv.length, unique: new Set(dv.map((v) => v.ipHash)).size };
    });

    // Por UF (para o mapa) — acessos do Brasil com região conhecida.
    const ufMap = new Map<string, number>();
    for (const v of views) if (v.region) ufMap.set(v.region, (ufMap.get(v.region) ?? 0) + 1);
    const byUf = [...ufMap.entries()]
      .map(([uf, count]) => ({ uf, count }))
      .sort((a, b) => b.count - a.count);

    return { eligible: true as const, title, total, unique, daily, byUf };
  }

  async update(id: string, editToken: string, dto: UpdateGiftDto) {
    await this.mustEdit(id, editToken);
    const gift = await this.repo.update(id, {
      occasion: dto.occasion ?? undefined,
      payload: dto.payload ? (dto.payload as Prisma.InputJsonValue) : undefined,
    });
    return this.withAssetUrls(gift);
  }

  async addAsset(id: string, editToken: string, dto: AddAssetDto) {
    await this.mustEdit(id, editToken);
    const asset = await this.repo.addAsset({
      giftId: id,
      type: dto.type,
      r2Key: dto.r2Key,
      order: dto.order ?? 0,
    });
    return this.serializeAsset(asset);
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
    const asset = await this.repo.addAsset({
      giftId: id,
      type: 'image',
      r2Key,
      order: gift.assets.length,
    });
    return this.serializeAsset(asset);
  }

  /**
   * Ativa o presente ao confirmar o pagamento (F1-6). Idempotente: se já está
   * pago, apenas retorna. Gera um slug único com retry em caso de colisão.
   */
  async markPaid(giftId: string, planKey?: string) {
    const gift = await this.repo.findById(giftId);
    if (!gift) throw new NotFoundException('Presente não encontrado');
    if (gift.status === 'paid') return gift;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.repo.markPaid(giftId, generateSlug(), planKey);
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

  /**
   * Serializa a URL pública em cada asset a partir do r2Key (fonte única de
   * verdade no back). Assim o front exibe a imagem sem precisar de uma cópia da
   * base pública do R2 — some o footgun de `<img src="">` por env faltando.
   */
  private withAssetUrls<T extends { assets: { r2Key: string }[] }>(gift: T) {
    return { ...gift, assets: gift.assets.map((a) => this.serializeAsset(a)) };
  }

  private serializeAsset<A extends { r2Key: string }>(asset: A) {
    return { ...asset, url: this.media.publicUrl(asset.r2Key) };
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
