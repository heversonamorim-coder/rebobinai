import { Injectable } from '@nestjs/common';
import { PHYSICAL_PRODUCTS, ProductKey } from './products';
import { StockRepository } from './stock.repository';

/**
 * Estoque dos produtos físicos (Tarefa 8). Default otimista: sem linha na
 * tabela, o produto é considerado disponível. O admin desliga a venda por falta
 * de estoque; o checkout bloqueia no servidor (não confia só na UI).
 */
@Injectable()
export class StockService {
  constructor(private readonly repo: StockRepository) {}

  /** Mapa { caneca: bool, camiseta: bool } — disponível quando não há registro. */
  async availabilityMap(): Promise<Record<ProductKey, boolean>> {
    const rows = await this.repo.findAll();
    const map = new Map(rows.map((r) => [r.productKey, r.available]));
    const out = {} as Record<ProductKey, boolean>;
    for (const key of Object.keys(PHYSICAL_PRODUCTS) as ProductKey[]) {
      out[key] = map.get(key) ?? true;
    }
    return out;
  }

  async isAvailable(productKey: string): Promise<boolean> {
    const row = await this.repo.findOne(productKey);
    return row?.available ?? true;
  }

  /** Lista pro admin: um item por produto com nome e disponibilidade. */
  async list() {
    const avail = await this.availabilityMap();
    return (Object.keys(PHYSICAL_PRODUCTS) as ProductKey[]).map((key) => ({
      productKey: key,
      name: PHYSICAL_PRODUCTS[key].name,
      available: avail[key],
    }));
  }

  async setAvailable(productKey: ProductKey, available: boolean) {
    await this.repo.upsert(productKey, available);
    return { productKey, available };
  }
}
