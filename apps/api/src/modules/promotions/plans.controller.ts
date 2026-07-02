import { Controller, Get } from '@nestjs/common';
import { PlanService } from './plan.service';

/** Catálogo público de planos (landing e checkout). */
@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlanService) {}

  @Get()
  list() {
    return this.plans.listActive();
  }
}
