import { redirect } from 'next/navigation';
import { fetchAdminOrders, isAdmin } from '../../lib/admin';
import { AdminDashboard } from '../../components/admin-dashboard';

// Sempre dinâmico: reflete os pedidos em tempo real.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');

  const orders = await fetchAdminOrders().catch(() => []);
  return <AdminDashboard orders={orders} />;
}
