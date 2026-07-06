import { fetchWorkOrderZip, isAdmin } from '../../../../lib/admin';

/**
 * Plano de produção (Tarefa 8): recebe { productKey, orderIds }, pede o ZIP à
 * API (autenticado por token) e devolve o binário pro browser baixar.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: 'Não autorizado.' }, { status: 401 });
  }
  const { productKey, orderIds } = (await req.json().catch(() => ({}))) as {
    productKey?: string;
    orderIds?: string[];
  };
  if (!productKey || !Array.isArray(orderIds) || orderIds.length === 0) {
    return Response.json({ ok: false, message: 'Selecione ao menos um pedido.' }, { status: 400 });
  }

  const upstream = await fetchWorkOrderZip(productKey, orderIds);
  if (!upstream.ok || !upstream.body) {
    const body = await upstream.json().catch(() => ({ message: 'Falha ao gerar o ZIP.' }));
    return Response.json(body, { status: upstream.status });
  }
  // Repassa o stream do ZIP com os headers de download.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/zip',
      'content-disposition':
        upstream.headers.get('content-disposition') ?? `attachment; filename="producao-${productKey}.zip"`,
    },
  });
}
