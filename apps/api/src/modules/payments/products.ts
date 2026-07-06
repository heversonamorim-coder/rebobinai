/**
 * Catálogo de produtos físicos do plano "+Lembrança física" (Tarefa 5).
 * Preços em centavos. O front espelha isso em apps/web/src/lib/products.ts —
 * mas o valor cobrado é SEMPRE resolvido aqui no servidor (nunca confia no
 * cliente). O plano em si é o PlanKey 'quadro' (chave interna estável).
 */
export type ProductKey = 'caneca' | 'camiseta';

export interface PhysicalProduct {
  key: ProductKey;
  name: string;
  /** Preço do produto em centavos (sem frete). */
  price: number;
  /** Caneca leva foto personalizada; camiseta não. */
  needsPhoto: boolean;
  /** Camiseta escolhe tamanho (P/M/G/GG); caneca não. */
  needsSize: boolean;
}

export const SHIRT_SIZES = ['P', 'M', 'G', 'GG'] as const;
export type ShirtSize = (typeof SHIRT_SIZES)[number];

export const PHYSICAL_PRODUCTS: Record<ProductKey, PhysicalProduct> = {
  caneca: { key: 'caneca', name: 'Caneca personalizada com QR', price: 6990, needsPhoto: true, needsSize: false },
  camiseta: { key: 'camiseta', name: 'Camiseta Rebobinaí com QR', price: 8990, needsPhoto: false, needsSize: true },
};

export function getProduct(key: string | undefined): PhysicalProduct | null {
  if (key === 'caneca' || key === 'camiseta') return PHYSICAL_PRODUCTS[key];
  return null;
}
