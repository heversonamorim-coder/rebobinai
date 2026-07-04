/** Tipos e helpers do presente no front — espelham o contrato da API (módulo gift). */

export interface TimelineItem {
  date?: string;
  title: string;
  description?: string;
}

export interface GiftPayload {
  title?: string;
  recipientName?: string;
  senderName?: string;
  letter?: string;
  timeline?: TimelineItem[];
  theme?: string;
  spotifyTrackUrl?: string;
  [k: string]: unknown;
}

export type GiftStatus = 'draft' | 'paid' | 'archived';

export interface GiftAsset {
  id: string;
  type: 'image' | 'audio';
  r2Key: string;
  order: number;
}

// Base pública do R2 (Cloudflare) — defina NEXT_PUBLIC_R2_PUBLIC_BASE_URL no
// Vercel com a mesma URL do R2_PUBLIC_BASE_URL da API.
const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');

/** URL pública da imagem a partir do r2Key. Vazia se a base não estiver setada. */
export function assetUrl(r2Key: string): string {
  return R2_BASE ? `${R2_BASE}/${r2Key}` : '';
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
  { value: 'namorada', label: 'Namorada' },
  { value: 'namorado', label: 'Namorado' },
  { value: 'esposa', label: 'Esposa' },
  { value: 'marido', label: 'Marido' },
  { value: 'mae', label: 'Mãe' },
  { value: 'pai', label: 'Pai' },
  { value: 'casamento', label: 'Casamento' },
  { value: 'amigas', label: 'Melhores amigas' },
  { value: 'avo', label: 'Avó / Avô' },
  { value: 'aniversario', label: 'Aniversário' },
  { value: 'outra', label: 'Outra ocasião' },
] as const;

export function occasionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return OCCASIONS.find((o) => o.value === value)?.label ?? value;
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
