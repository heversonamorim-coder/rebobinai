import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

const trackingSchema = z.object({ trackingCode: z.string().min(3).max(60) });
type TrackingDto = z.infer<typeof trackingSchema>;

/** Admin de vendas (Tarefa 6) — protegido por token compartilhado (AdminGuard). */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('orders')
  orders() {
    return this.admin.listOrders();
  }

  @Patch('orders/:id/tracking')
  setTracking(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(trackingSchema)) dto: TrackingDto,
  ) {
    return this.admin.setTracking(id, dto.trackingCode);
  }
}
