import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, checkCredentials, sessionCookieValue } from '../../../../lib/admin';

/** Login do admin (Tarefa 6): valida usuário/senha (env) e grava o cookie. */
export async function POST(req: Request) {
  const { user, password } = (await req.json().catch(() => ({}))) as {
    user?: string;
    password?: string;
  };

  if (!checkCredentials(user ?? '', password ?? '')) {
    return NextResponse.json({ ok: false, message: 'Usuário ou senha inválidos.' }, { status: 401 });
  }
  const secret = sessionCookieValue();
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: 'Admin não configurado (ADMIN_API_TOKEN ausente).' },
      { status: 503 },
    );
  }

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
