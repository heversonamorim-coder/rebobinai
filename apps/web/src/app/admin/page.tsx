import { redirect } from 'next/navigation';
import { fetchAdminGifts, fetchAdminOrders, isAdmin } from '../../lib/admin';
import { AdminDashboard } from '../../components/admin-dashboard';

// Sempre dinâmico: reflete os pedidos em tempo real.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');

  // Busca vendas e rebobinadas; se a API falhar, mostra o erro (em vez de vazio).
  let error: string | null = null;
  const [orders, gifts] = await Promise.all([
    fetchAdminOrders().catch((e: unknown) => {
      error = e instanceof Error ? e.message : 'Falha ao carregar os pedidos.';
      return [];
    }),
    fetchAdminGifts().catch((e: unknown) => {
      error = error ?? (e instanceof Error ? e.message : 'Falha ao carregar as rebobinadas.');
      return [];
    }),
  ]);

  return <AdminDashboard orders={orders} gifts={gifts} error={error} />;
}
