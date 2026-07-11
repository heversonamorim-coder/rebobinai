/** Tipos e helpers do presente no front — espelham o contrato da API (módulo gift). */

export interface TimelineItem {
  date?: string;
  title: string;
  description?: string;
  /** Foto opcional do momento — id de um GiftAsset já enviado. */
  photoAssetId?: string;
}

/** Contador de dias — data (nunca assume casal) + label editável. */
export interface GiftCounter {
  targetDate?: string;
  label?: string;
}

/** Card do "Os números de vocês". Auto = derivado da data (value no render). */
export interface GiftStat {
  auto?: 'days_since_counter';
  value?: number;
  suffix?: string;
  label: string;
}

export interface GiftPayload {
  title?: string;
  recipientName?: string;
  senderName?: string;
  letter?: string;
  timeline?: TimelineItem[];
  counter?: GiftCounter;
  stats?: GiftStat[];
  /** Recado de fechamento — último slide antes do compartilhar (Tarefa 3). */
  closingMessage?: string;
  /** Foto opcional do slide de recado final (id de um GiftAsset). */
  closingPhotoAssetId?: string;
  /** Roleta de sorteio (Tarefa 4): opções que o destinatário sorteia. */
  roulette?: { options?: string[] };
  /** Mapa do lugar onde se conheceram (Tarefa 4). */
  metPlace?: { address?: string };
  /** Mapa astral simples — signo da data escolhida (Tarefa 4). */
  astro?: { date?: string };
  theme?: string;
  spotifyTrackUrl?: string;
  /**
   * Fotos embutidas — usado pelos exemplos da galeria (seed F2-5) para
   * carregar as imagens do R2 direto no payload, já que Example não tem
   * relação de assets própria. Nos presentes reais, as fotos vêm de
   * Gift.assets (não daqui).
   */
  assets?: GiftAsset[];
  [k: string]: unknown;
}

export type GiftStatus = 'draft' | 'paid' | 'archived';

export interface GiftAsset {
  id: string;
  type: 'image' | 'audio';
  r2Key: string;
  order: number;
  /** URL pública já montada pela API (fonte de verdade). */
  url?: string;
}

// Base pública do R2 (Cloudflare) — fallback opcional. A API já devolve a URL
// pronta em cada asset; este env só é usado se `asset.url` vier vazio.
const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');

/**
 * URL pública da imagem. Prefere a `url` que a API já montou (a partir do
 * R2_PUBLIC_BASE_URL do back); só cai no env do front se ela vier vazia.
 * Vazia se nenhuma base estiver configurada.
 */
export function assetUrl(asset: Pick<GiftAsset, 'r2Key' | 'url'>): string {
  if (asset.url) return asset.url;
  return R2_BASE ? `${R2_BASE}/${asset.r2Key}` : '';
}

export interface Gift {
  id: string;
  slug: string | null;
  status: GiftStatus;
  occasion: string | null;
  payload: GiftPayload;
  watermark: boolean;
  viewCount: number;
  editToken: string;
  assets: GiftAsset[];
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

/** Exemplo pronto por persona (galeria) — base pra clonar (F2-5). */
export interface Example {
  id: string;
  persona: string;
  name: string;
  occasion: string | null;
  payload: GiftPayload;
  seoSlug: string;
  sortOrder: number;
}

/** Projeção pública do presente (sem editToken) — usada no SSR de /p/:slug. */
export interface PublicGift {
  id: string;
  slug: string;
  status: GiftStatus;
  occasion: string | null;
  payload: GiftPayload;
  watermark: boolean;
  viewCount: number;
  assets: GiftAsset[];
  createdAt: string;
  paidAt: string | null;
}

/** Ocasiões oferecidas no editor (também viram iscas de SEO na galeria, F2-6). */
export const OCCASIONS = [
  { value: 'namorados', label: 'Namorada / Namorado' },
  { value: 'conjuge', label: 'Esposa / Marido' },
  { value: 'pais', label: 'Mãe / Pai' },
  { value: 'avos', label: 'Avó / Avô' },
  { value: 'casamento', label: 'Casamento' },
  { value: 'aniversario', label: 'Aniversário' },
] as const;

export function occasionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const found = OCCASIONS.find((o) => o.value === value);
  if (found) return found.label;
  // Valores legados (namorada, pai, amigas…): mostra capitalizado.
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ── "Os números de vocês" ─────────────────────────────────────────────────────

/**
 * Label default do contador, derivado da Ocasião (nunca assume casal na
 * pergunta, só no rótulo sugerido). Sempre editável pelo usuário.
 */
export function defaultCounterLabel(occasion: string | null | undefined): string {
  switch (occasion) {
    case 'namorados':
    case 'conjuge':
    case 'casamento':
      return 'juntos há';
    case 'pais':
    case 'avos':
      return 'de vida juntos';
    case 'aniversario':
      return 'de você no mundo';
    case 'amizade': // não está no dropdown atual, mas fica pronto
      return 'de amizade';
    default:
      return 'dessa história';
  }
}

/** Chips de sugestão de stats, variando por Ocasião. */
export function statChipsFor(occasion: string | null | undefined): GiftStat[] {
  switch (occasion) {
    case 'namorados':
    case 'conjuge':
    case 'casamento':
      return [
        { value: 5, suffix: 'viagens', label: 'e contando' },
        { value: 300, suffix: 'fotos juntos', label: 'e subindo' },
        { value: 3, suffix: 'copas do mundo', label: 'assistidas juntos' },
      ];
    case 'pais':
      return [
        { value: 20, suffix: 'churrascos', label: 'e contando' },
        { value: 50, suffix: 'conselhos', label: 'que colaram' },
        { value: 200, suffix: 'caronas', label: 'sem reclamar' },
      ];
    case 'amizade':
      return [
        { value: 500, suffix: 'áudios de 5 min', label: 'ouvidos' },
        { value: 30, suffix: 'perrengues', label: 'superados' },
        { suffix: '∞', label: 'risadas' },
      ];
    default:
      return [
        { value: 300, suffix: 'fotos juntos', label: 'e subindo' },
        { suffix: '∞', label: 'risadas' },
      ];
  }
}

/** Texto do chip (o "∞" vem no fim, ex.: "risadas ∞"). */
export function statChipText(chip: GiftStat): string {
  return chip.value == null && chip.suffix ? `${chip.label} ${chip.suffix}` : (chip.suffix ?? chip.label);
}

/** Dias inteiros decorridos desde a data (>= 0). null se a data for inválida. */
export function daysSince(targetDate: string | undefined | null): number | null {
  if (!targetDate) return null;
  const start = new Date(targetDate).getTime();
  if (Number.isNaN(start)) return null;
  const diff = Date.now() - start;
  return Math.max(0, Math.floor(diff / 86_400_000));
}

// ── Referência do rascunho no navegador (guest-first, sem login) ──────────────

const DRAFT_KEY = 'rebobinai:draft';

export interface DraftRef {
  id: string;
  editToken: string;
}

export function saveDraftRef(ref: DraftRef): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(ref));
  } catch {
    // localStorage indisponível (modo privado etc.) — segue sem persistir.
  }
}

export function loadDraftRef(): DraftRef | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftRef;
    return parsed?.id && parsed?.editToken ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraftRef(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
