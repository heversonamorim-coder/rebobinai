/**
 * Produtos físicos do plano "+Lembrança física" (Tarefa 5). Espelha o catálogo
 * da API (apps/api/src/modules/payments/products.ts). O preço final cobrado é
 * sempre resolvido no servidor; isto aqui é só pra render instantâneo.
 */
export type ProductKey = 'caneca' | 'camiseta';

export interface PhysicalProduct {
  key: ProductKey;
  name: string;
  price: number; // centavos
  needsPhoto: boolean;
}

export const PHYSICAL_PRODUCTS: PhysicalProduct[] = [
  { key: 'caneca', name: 'Caneca personalizada com QR', price: 6990, needsPhoto: true },
  { key: 'camiseta', name: 'Camiseta Rebobinaí com QR', price: 8990, needsPhoto: false },
];

/** Endereço de entrega do produto físico. */
export interface Shipping {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  uf: string;
}

export interface FreightQuote {
  product: { key: ProductKey; name: string; price: number };
  cep: string;
  region: string;
  shippingCost: number;
  total: number;
}

export function emptyShipping(): Shipping {
  return { name: '', phone: '', cep: '', street: '', number: '', complement: '', district: '', city: '', uf: '' };
}

/**
 * Preço "a partir de" do plano físico = o produto mais barato do catálogo
 * (hoje a caneca, R$ 69,90). Fonte única pro display, independente do valor
 * cosmético do plano no banco — o que cobra de verdade é produto + frete.
 */
export function physicalFromPrice(): number {
  return Math.min(...PHYSICAL_PRODUCTS.map((p) => p.price));
}
