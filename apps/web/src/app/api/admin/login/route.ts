import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, sessionCookieValue } from '../../../../lib/admin';

// ---------------------------------------------------------------------------
// Rate limiting em memória: máx. 5 tentativas de login por IP em 15 minutos.
// Em múltiplas instâncias use Redis; aqui basta para um único pod.
// ---------------------------------------------------------------------------
interface IpEntry {
  count: number;
  windowStart: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, IpEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos de lockout

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff?.split(',')[0]?.trim() ?? 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  // Janela expirou — reseta
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 0, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, retryAfter: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true };
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/** Compara duas strings usando timingSafeEqual para prevenir timing attacks. */
function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Executa a comparação de qualquer jeito para manter tempo constante.
    timingSafeEqual(Buffer.alloc(bufB.length), bufB);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Login do admin (Tarefa 6): valida usuário/senha (env) e grava o cookie. */
export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Verifica rate limiting antes de qualquer processamento.
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 900) } },
    );
  }

  const { user, password } = (await req.json().catch(() => ({}))) as {
    user?: string;
    password?: string;
  };

  const expectedUser = process.env.ADMIN_USER ?? '';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';

  // Usa timingSafeEqual para evitar timing attacks nas credenciais.
  const credentialsValid =
    Boolean(expectedUser) &&
    Boolean(expectedPassword) &&
    safeStringEqual(user ?? '', expectedUser) &&
    safeStringEqual(password ?? '', expectedPassword);

  if (!credentialsValid) {
    recordFailure(ip);
    return NextResponse.json({ ok: false, message: 'Usuário ou senha inválidos.' }, { status: 401 });
  }

  const secret = sessionCookieValue();
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: 'Admin não configurado (ADMIN_API_TOKEN ausente).' },
      { status: 503 },
    );
  }

  // Login bem-sucedido: limpa o contador de falhas.
  resetAttempts(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
  });
  return res;
}

/** Logout — limpa o cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
