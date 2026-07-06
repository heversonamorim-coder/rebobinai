import { cookies } from 'next/headers';
import type { AdminGift, AdminMessage, AdminOrder } from './admin-types';

/**
 * Helpers de servidor do admin (Tarefa 6). O navegador nunca vê as credenciais
 * nem o token da API: o operador loga com usuário/senha (env), o cookie guarda
 * só um segredo de sessão, e as chamadas à API saem daqui com o x-admin-token.
 */

export const ADMIN_COOKIE = 'rb_admin';

/** Base da API no lado do servidor (não usa NEXT_PUBLIC pra não vazar). */
function apiBase(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001'
  ).replace(/\/+$/, '');
}

/** Segredo de sessão gravado no cookie após o login (o próprio token da API). */
function sessionSecret(): string | undefined {
  return process.env.ADMIN_API_TOKEN;
}

/** Confere usuário/senha do operador (env). */
export function checkCredentials(user: string, password: string): boolean {
  const u = process.env.ADMIN_USER;
  const p = process.env.ADMIN_PASSWORD;
  return Boolean(u && p && user === u && password === p);
}

export function sessionCookieValue(): string | null {
  return sessionSecret() ?? null;
}

/** true se o cookie de sessão bate com o segredo — usado nas rotas protegidas. */
export async function isAdmin(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === secret;
}

/** Lista de pedidos (server-side, autenticada por token). */
export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const token = sessionSecret();
  if (!token) throw new Error('ADMIN_API_TOKEN não configurado no site.');
  const res = await fetch(`${apiBase()}/admin/orders`, {
    headers: { 'x-admin-token': token },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Falha ao listar pedidos na API (${res.status}) — confira API_URL e ADMIN_API_TOKEN.`);
  return res.json() as Promise<AdminOrder[]>;
}

/** Lista de rebobinadas (gifts) criadas (server-side, autenticada por token). */
export async function fetchAdminGifts(): Promise<AdminGift[]> {
  const token = sessionSecret();
  if (!token) throw new Error('ADMIN_API_TOKEN não configurado no site.');
  const res = await fetch(`${apiBase()}/admin/gifts`, {
    headers: { 'x-admin-token': token },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Falha ao listar rebobinadas na API (${res.status}) — confira API_URL e ADMIN_API_TOKEN.`);
  return res.json() as Promise<AdminGift[]>;
}

/** Lista as mensagens do "fale conosco" (server-side, autenticada por token). */
export async function fetchAdminMessages(): Promise<AdminMessage[]> {
  const token = sessionSecret();
  if (!token) throw new Error('ADMIN_API_TOKEN não configurado no site.');
  const res = await fetch(`${apiBase()}/admin/messages`, {
    headers: { 'x-admin-token': token },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Falha ao listar mensagens na API (${res.status}) — confira API_URL e ADMIN_API_TOKEN.`);
  return res.json() as Promise<AdminMessage[]>;
}

/** Marca/desmarca uma mensagem do contato como tratada (server-side). */
export async function setMessageHandled(
  id: string,
  handled: boolean,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const token = sessionSecret();
  if (!token) return { ok: false, status: 401, body: { message: 'Admin não configurado.' } };
  const res = await fetch(`${apiBase()}/admin/messages/${encodeURIComponent(id)}/handled`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify({ handled }),
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

/** Grava o código de rastreio de um pedido (server-side). */
export async function setOrderTracking(
  orderId: string,
  trackingCode: string,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const token = sessionSecret();
  if (!token) return { ok: false, status: 401, body: { message: 'Admin não configurado.' } };
  const res = await fetch(`${apiBase()}/admin/orders/${encodeURIComponent(orderId)}/tracking`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify({ trackingCode }),
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}
