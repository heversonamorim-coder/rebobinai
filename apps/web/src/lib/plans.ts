/** Planos e formatação de preço no front — espelham o módulo promotions (F1-9). */

export type PlanKey = 'free' | 'digital' | 'forever' | 'quadro';

export interface Plan {
  id: string;
  key: PlanKey;
  name: string;
  tagline: string | null;
  fullPrice: number; // centavos
  launchPrice: number; // centavos
  launchEndsAt: string | null;
  features: string[];
  active: boolean;
  sortOrder: number;
}

/**
 * Fallback estático (espelha o seed da migração). A landing é resiliente: se a
 * API não responder no request, ainda renderiza os planos.
 */
export const PLANS_FALLBACK: Plan[] = [
  {
    id: 'plan_free',
    key: 'free',
    name: 'Grátis',
    tagline: 'Crie e veja a prévia',
    fullPrice: 0,
    launchPrice: 0,
    launchEndsAt: null,
    features: ['Criar e ver a prévia', 'Com marca d’água', 'Sem link compartilhável'],
    active: true,
    sortOrder: 0,
  },
  {
    id: 'plan_digital',
    key: 'digital',
    name: 'Digital',
    tagline: 'O presente no ar',
    fullPrice: 2490,
    launchPrice: 1990,
    launchEndsAt: null,
    features: ['Link + QR code', 'Música e fotos', 'Hospedagem por 1 ano', 'Sem marca d’água'],
    active: true,
    sortOrder: 1,
  },
  {
    id: 'plan_forever',
    key: 'forever',
    name: 'Pra Sempre',
    tagline: 'Vitalício, com IA',
    fullPrice: 3990,
    launchPrice: 2990,
    launchEndsAt: null,
    features: ['Tudo do Digital', 'Vitalício', 'IA ilimitada', 'Analytics de aberturas', 'Mais fotos'],
    active: true,
    sortOrder: 2,
  },
  {
    id: 'plan_quadro',
    key: 'quadro',
    name: '+ Lembrança Física',
    tagline: 'Uma lembrança física com QR',
    fullPrice: 6990,
    launchPrice: 6990,
    launchEndsAt: null,
    features: ['Tudo do Pra Sempre', 'Caneca ou camiseta com QR', 'A partir de R$ 69,90 + frete'],
    active: true,
    sortOrder: 3,
  },
];

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

export interface PriceDisplay {
  /** Preço vigente formatado ("Grátis" quando 0). */
  current: string;
  /** Preço cheio tachado, quando há desconto de lançamento. */
  strikethrough: string | null;
  /** Aviso de compliance (CDC): só afirma prazo quando há data real. */
  note: string | null;
}

export function priceDisplay(plan: Plan): PriceDisplay {
  if (plan.launchPrice === 0) {
    return { current: 'Grátis', strikethrough: null, note: null };
  }
  const onLaunch = plan.launchPrice < plan.fullPrice;
  return {
    current: formatBRL(plan.launchPrice),
    strikethrough: onLaunch ? formatBRL(plan.fullPrice) : null,
    note: onLaunch
      ? plan.launchEndsAt
        ? `preço de lançamento — sobe para ${formatBRL(plan.fullPrice)} em ${formatDate(plan.launchEndsAt)}`
        : 'preço de lançamento'
      : null,
  };
}
