import { NextResponse } from 'next/server';
import { isAdmin, setOrderTracking } from '../../../../../../lib/admin';

/** Grava o rastreio de um pedido (proxy autenticado → API). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;
  const { trackingCode } = (await req.json().catch(() => ({}))) as { trackingCode?: string };
  if (!trackingCode || trackingCode.trim().length < 3) {
    return NextResponse.json({ ok: false, message: 'Código de rastreio inválido.' }, { status: 400 });
  }
  const result = await setOrderTracking(id, trackingCode.trim());
  return NextResponse.json(result.body, { status: result.status });
}
