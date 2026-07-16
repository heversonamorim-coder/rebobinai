/** Tipos do admin de vendas (Tarefa 6) — sem imports de servidor, ok no client. */
import type { Shipping } from './products';

export interface AdminOrder {
  id: string;
  giftId: string;
  createdAt: string;
  paidAt: string | null;
  status: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  planKey: string;
  amountCharged: number;
  billingType: string | null;
  customerEmail: string | null;
  productKey: string | null;
  productName: string | null;
  productSize: string | null;
  photoUrl: string | null;
  shipping: Shipping | null;
  shippingCost: number | null;
  trackingCode: string | null;
  shippedAt: string | null;
  gift: { slug: string | null; title: string | null };
}

export interface AdminGift {
  id: string;
  slug: string | null;
  status: 'draft' | 'paid' | 'archived';
  occasion: string | null;
  title: string | null;
  recipientName: string | null;
  senderName: string | null;
  viewCount: number;
  createdAt: string;
  paidAt: string | null;
}

/** Mensagem do "fale conosco" (rodapé), lida no admin (Tarefa 2). */
export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

/** Estoque de um produto físico (Tarefa 8). */
export interface AdminStock {
  productKey: string;
  name: string;
  available: boolean;
}
