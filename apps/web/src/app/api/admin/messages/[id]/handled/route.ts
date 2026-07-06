import { NextResponse } from 'next/server';
import { isAdmin, setMessageHandled } from '../../../../../../lib/admin';

/** Marca/desmarca uma mensagem do contato como tratada (proxy autenticado → API). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;
  const { handled } = (await req.json().catch(() => ({}))) as { handled?: boolean };
  const result = await setMessageHandled(id, Boolean(handled));
  return NextResponse.json(result.body, { status: result.status });
}
