import { redirect } from 'next/navigation';
import { fetchAdminGifts, fetchAdminMessages, fetchAdminOrders, isAdmin } from '../../lib/admin';
import { AdminDashboard } from '../../components/admin-dashboard';

// Sempre dinâmico: reflete os pedidos em tempo real.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');

  // Busca vendas, rebobinadas e mensagens; se a API falhar, mostra o erro.
  let error: string | null = null;
  const [orders, gifts, messages] = await Promise.all([
    fetchAdminOrders().catch((e: unknown) => {
      error = e instanceof Error ? e.message : 'Falha ao carregar os pedidos.';
      return [];
    }),
    fetchAdminGifts().catch((e: unknown) => {
      error = error ?? (e instanceof Error ? e.message : 'Falha ao carregar as rebobinadas.');
      return [];
    }),
    fetchAdminMessages().catch((e: unknown) => {
      error = error ?? (e instanceof Error ? e.message : 'Falha ao carregar as mensagens.');
      return [];
    }),
  ]);

  return <AdminDashboard orders={orders} gifts={gifts} messages={messages} error={error} />;
}
