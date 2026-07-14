import type { Example, Gift, GiftAsset, GiftPayload, PublicGift } from './gift';
import type { Plan } from './plans';
import type { FreightQuote, ProductKey, Shipping } from './products';

/**
 * Cliente da API do presente (módulo gift). O guest cria e edita com o
 * `editToken` devolvido na criação, enviado no header `x-edit-token`.
 * Em produção, defina NEXT_PUBLIC_API_URL para a URL da API no Railway.
 */
// Normaliza a base: remove barra(s) no final para não gerar "//gifts" quando
// a env vier com barra sobrando (ex.: "https://api.railway.app/").
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // corpo não-JSON — mantém a mensagem padrão
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export interface CreateGiftInput {
  occasion?: string;
  payload?: GiftPayload;
}

export function createGift(input: CreateGiftInput): Promise<Gift> {
  return request<Gift>('/gifts', { method: 'POST', body: JSON.stringify(input) });
}

export function getGift(id: string, editToken: string): Promise<Gift> {
  return request<Gift>(`/gifts/${id}`, { headers: { 'x-edit-token': editToken } });
}

export function updateGift(id: string, editToken: string, input: CreateGiftInput): Promise<Gift> {
  return request<Gift>(`/gifts/${id}`, {
    method: 'PATCH',
    headers: { 'x-edit-token': editToken },
    body: JSON.stringify(input),
  });
}

export type PlanKeyPaid = 'digital' | 'forever' | 'quadro';

export interface CheckoutCustomer {
  name: string;
  email: string;
  cpfCnpj: string;
}

export interface PixCheckoutResult {
  orderId: string;
  status: string;
  pix: { qrImage: string; copyPaste: string; expiresAt: string | null };
}

export interface CardCheckoutResult {
  orderId: string;
  status: string;
}

export interface OrderStatus {
  orderId: string;
  status: string;
}

/** Campos do plano físico ("+Lembrança física"), opcionais nos demais planos. */
export interface PhysicalCheckout {
  product?: ProductKey;
  photoAssetId?: string;
  size?: string;
  shipping?: Shipping;
}

export function checkoutPix(
  input: {
    giftId: string;
    editToken: string;
    planKey: PlanKeyPaid;
    customer: CheckoutCustomer;
  } & PhysicalCheckout,
): Promise<PixCheckoutResult> {
  return request<PixCheckoutResult>('/checkout/pix', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function checkoutCard(
  input: {
    giftId: string;
    editToken: string;
    planKey: PlanKeyPaid;
    customer: CheckoutCustomer;
    card: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string };
    holder: { postalCode: string; addressNumber: string; phone: string };
  } & PhysicalCheckout,
): Promise<CardCheckoutResult> {
  return request<CardCheckoutResult>('/checkout/card', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return request<OrderStatus>(`/checkout/orders/${orderId}`, { cache: 'no-store' });
}

/**
 * Disponibilidade de estoque por produto (Tarefa 8). Falha-otimista: se a API
 * não responder, considera disponível (o checkout re-valida no servidor).
 */
export async function getProductAvailability(): Promise<Partial<Record<ProductKey, boolean>>> {
  try {
    const list = await request<{ key: ProductKey; available?: boolean }[]>('/checkout/products', {
      cache: 'no-store',
    });
    return Object.fromEntries(list.map((p) => [p.key, p.available !== false]));
  } catch {
    return {};
  }
}

/** Cotação de frete por CEP + total do produto físico. */
export function getFreight(cep: string, product: ProductKey): Promise<FreightQuote> {
  return request<FreightQuote>('/checkout/freight', {
    method: 'POST',
    body: JSON.stringify({ cep, product }),
  });
}

/**
 * Upload com progresso (XHR) — permite mostrar a barra enquanto o arquivo sobe.
 * `onProgress` recebe 0–100. Cai pra indeterminado se o total não vier.
 */
export function uploadGiftImageProgress(
  id: string,
  editToken: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<GiftAsset> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/gifts/${id}/assets/upload`);
    xhr.setRequestHeader('x-edit-token', editToken);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as GiftAsset);
        } catch {
          reject(new ApiError(xhr.status, 'Resposta inválida do servidor.'));
        }
      } else {
        let message = `Erro ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText) as { message?: string };
          if (body?.message) message = body.message;
        } catch {
          // corpo não-JSON
        }
        reject(new ApiError(xhr.status, message));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, 'Falha de rede no upload.'));
    xhr.send(form);
  });
}

export function removeGiftAsset(id: string, editToken: string, assetId: string): Promise<unknown> {
  return request(`/gifts/${id}/assets/${assetId}`, {
    method: 'DELETE',
    headers: { 'x-edit-token': editToken },
  });
}

/** Galeria de exemplos por persona (F2-5). */
export async function getExamples(): Promise<Example[]> {
  try {
    return await request<Example[]>('/examples', { cache: 'no-store' });
  } catch {
    return [];
  }
}

/** Um exemplo da galeria pelo seoSlug (prévia em stories /exemplos/:seoSlug). */
export async function getExampleBySeoSlug(seoSlug: string): Promise<Example | null> {
  const all = await getExamples();
  return all.find((e) => e.seoSlug === seoSlug) ?? null;
}

/** Clona um exemplo num rascunho novo e devolve o presente (com editToken). */
export function cloneExample(id: string): Promise<Gift> {
  return request<Gift>(`/examples/${id}/clone`, { method: 'POST' });
}

/**
 * Compositor de IA (F3-1): um parágrafo → rascunho editável { occasion, payload }.
 * A API pode devolver campos como null; normalizamos para undefined para casar
 * com GiftPayload e não sobrescrever o formulário com nulos.
 */
interface AiDraftResponse {
  occasion: string | null;
  payload: {
    title: string;
    recipientName: string | null;
    senderName: string | null;
    letter: string;
    counter?: { targetDate?: string | null } | null;
    closingMessage?: string | null;
    timeline: { date: string | null; title: string; description: string | null }[];
  };
  /** Gerações grátis de IA restantes hoje (freemium). */
  remaining?: number;
}

export interface DraftResult {
  occasion?: string;
  payload: GiftPayload;
  remaining?: number;
}

/**
 * Compositor de IA. Passa o rascunho atual (giftId/editToken) quando existe —
 * assim o servidor marca composedWithAi (trava o Digital no checkout). Estourar
 * a cota grátis vira um ApiError com status 429 (o front mostra o upsell).
 */
export async function draftFromText(
  text: string,
  gift?: { id: string; editToken: string },
): Promise<DraftResult> {
  const res = await request<AiDraftResponse>('/ai/draft', {
    method: 'POST',
    body: JSON.stringify({ text, giftId: gift?.id, editToken: gift?.editToken }),
  });
  const p = res.payload;
  return {
    remaining: res.remaining,
    occasion: res.occasion ?? undefined,
    payload: {
      title: p.title,
      recipientName: p.recipientName ?? undefined,
      senderName: p.senderName ?? undefined,
      letter: p.letter,
      ...(p.counter?.targetDate ? { counter: { targetDate: p.counter.targetDate } } : {}),
      ...(p.closingMessage ? { closingMessage: p.closingMessage } : {}),
      timeline: (p.timeline ?? []).map((t) => ({
        date: t.date ?? undefined,
        title: t.title,
        description: t.description ?? undefined,
      })),
    },
  };
}

/** Catálogo de planos (landing/checkout). Revalida de hora em hora (ISR). */
export async function getPlans(): Promise<Plan[]> {
  try {
    return await request<Plan[]>('/plans', { next: { revalidate: 3600 } });
  } catch {
    return [];
  }
}

/** "Fale conosco" (rodapé) — grava a mensagem pra leitura no admin. */
export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export function sendContactMessage(input: ContactInput): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Estatísticas de acesso do presente (analytics). */
export interface GiftStats {
  eligible: boolean;
  title: string | null;
  total?: number;
  unique?: number;
  daily?: { day: string; total: number; unique: number }[];
  byUf?: { uf: string; count: number }[];
}

/** Beacon do navegador: registra o acesso (best-effort, não bloqueia a página). */
export function recordGiftView(slug: string): void {
  try {
    void fetch(`${BASE}/public/gifts/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
      keepalive: true,
    });
  } catch {
    // beacon é best-effort — falha não afeta a experiência
  }
}

/** Estatísticas do presente por slug. null se o presente não existe. */
export async function getGiftStats(slug: string): Promise<GiftStats | null> {
  try {
    return await request<GiftStats>(`/public/gifts/${encodeURIComponent(slug)}/stats`, {
      cache: 'no-store',
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Leitura pública por slug (SSR de /p/:slug). Retorna null quando não existe. */
export async function getPublicGift(slug: string): Promise<PublicGift | null> {
  try {
    return await request<PublicGift>(`/public/gifts/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
