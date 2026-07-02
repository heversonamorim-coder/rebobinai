import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { PlanRepository } from './plan.repository';

@Injectable()
export class PlanService {
  constructor(private readonly repo: PlanRepository) {}

  /** Planos ativos, ordenados — alimenta a landing e o checkout (F1-7/F1-5). */
  listActive() {
    return this.repo.listActive();
  }

  /** Plano por chave — usado pelo checkout para resolver o preço vigente. */
  getByKey(key: $Enums.PlanKey) {
    return this.repo.findByKey(key);
  }
}
