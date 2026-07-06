import { NextResponse } from 'next/server';
import { isAdmin, setStockAvailable } from '../../../../../lib/admin';

/** Liga/desliga a venda de um produto (proxy autenticado → API). */
export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: 'Não autorizado.' }, { status: 401 });
  }
  const { key } = await params;
  const { available } = (await req.json().catch(() => ({}))) as { available?: boolean };
  const result = await setStockAvailable(key, Boolean(available));
  return NextResponse.json(result.body, { status: result.status });
}
