/** Tipos do admin de vendas (Tarefa 6) — sem imports de servidor, ok no client. */
import type { Shipping } from './products';

export interface AdminOrder {
  id: string;
  createdAt: string;
  paidAt: string | null;
  status: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  planKey: string;
  amountCharged: number;
  billingType: string | null;
  customerEmail: string | null;
  productKey: string | null;
  productName: string | null;
  photoUrl: string | null;
  shipping: Shipping | null;
  shippingCost: number | null;
  trackingCode: string | null;
  shippedAt: string | null;
  gift: { slug: string | null; title: string | null };
}
