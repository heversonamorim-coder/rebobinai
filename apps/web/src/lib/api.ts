import type { Gift, GiftPayload, PublicGift } from './gift';

/**
 * Cliente da API do presente (módulo gift). O guest cria e edita com o
 * `editToken` devolvido na criação, enviado no header `x-edit-token`.
 * Em produção, defina NEXT_PUBLIC_API_URL para a URL da API no Railway.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
