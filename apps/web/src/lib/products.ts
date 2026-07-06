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
  /** Camiseta escolhe tamanho (P/M/G/GG); caneca não. */
  needsSize: boolean;
  /** Foto do produto no /public (o cliente sobe depois; há fallback visual). */
  image: string;
  /** Emoji de fallback enquanto a imagem não existe. */
  emoji: string;
}

export const PHYSICAL_PRODUCTS: PhysicalProduct[] = [
  {
    key: 'caneca',
    name: 'Caneca personalizada com QR',
    price: 6990,
    needsPhoto: true,
    needsSize: false,
    image: '/produtos/caneca.webp',
    emoji: '☕',
  },
  {
    key: 'camiseta',
    name: 'Camiseta Rebobinaí com QR',
    price: 8990,
    needsPhoto: false,
    needsSize: true,
    image: '/produtos/camiseta.webp',
    emoji: '👕',
  },
];

/** Tamanhos oferecidos pra camiseta. */
export const SHIRT_SIZES = ['P', 'M', 'G', 'GG'] as const;
export type ShirtSize = (typeof SHIRT_SIZES)[number];

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
