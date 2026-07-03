import type { Example, Gift, GiftPayload, PublicGift } from './gift';
import type { Plan } from './plans';

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

export function checkoutPix(input: {
  giftId: string;
  editToken: string;
  planKey: PlanKeyPaid;
  customer: CheckoutCustomer;
}): Promise<PixCheckoutResult> {
  return request<PixCheckoutResult>('/checkout/pix', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function checkoutCard(input: {
  giftId: string;
  editToken: string;
  planKey: PlanKeyPaid;
  customer: CheckoutCustomer;
  card: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string };
  holder: { postalCode: string; addressNumber: string; phone: string };
}): Promise<CardCheckoutResult> {
  return request<CardCheckoutResult>('/checkout/card', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return request<OrderStatus>(`/checkout/orders/${orderId}`, { cache: 'no-store' });
}

/** Galeria de exemplos por persona (F2-5). */
export async function getExamples(): Promise<Example[]> {
  try {
    return await request<Example[]>('/examples', { cache: 'no-store' });
  } catch {
    return [];
  }
}

/** Clona um exemplo num rascunho novo e devolve o presente (com editToken). */
export function cloneExample(id: string): Promise<Gift> {
  return request<Gift>(`/examples/${id}/clone`, { method: 'POST' });
}

/** Catálogo de planos (landing/checkout). Revalida de hora em hora (ISR). */
export async function getPlans(): Promise<Plan[]> {
  try {
    return await request<Plan[]>('/plans', { next: { revalidate: 3600 } });
  } catch {
    return [];
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
