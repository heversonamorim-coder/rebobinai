import { Body, Controller, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

const trackingSchema = z.object({ trackingCode: z.string().min(3).max(60) });
type TrackingDto = z.infer<typeof trackingSchema>;

const handledSchema = z.object({ handled: z.boolean() });
type HandledDto = z.infer<typeof handledSchema>;

const stockSchema = z.object({ available: z.boolean() });
type StockDto = z.infer<typeof stockSchema>;

const productKeySchema = z.enum(['caneca', 'camiseta']);

const workOrderSchema = z.object({
  productKey: productKeySchema,
  orderIds: z.array(z.string().min(1)).min(1).max(500),
});
type WorkOrderDto = z.infer<typeof workOrderSchema>;

/** Admin de vendas (Tarefa 6) — protegido por token compartilhado (AdminGuard). */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('orders')
  orders() {
    return this.admin.listOrders();
  }

  @Get('gifts')
  gifts() {
    return this.admin.listGifts();
  }

  @Patch('orders/:id/tracking')
  setTracking(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(trackingSchema)) dto: TrackingDto,
  ) {
    return this.admin.setTracking(id, dto.trackingCode);
  }

  @Get('messages')
  messages() {
    return this.admin.listMessages();
  }

  @Patch('messages/:id/handled')
  setMessageHandled(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(handledSchema)) dto: HandledDto,
  ) {
    return this.admin.setMessageHandled(id, dto.handled);
  }

  // ── Estoque + plano de produção (Tarefa 8) ───────────────────────────────
  @Get('stock')
  stock() {
    return this.admin.listStock();
  }

  @Patch('stock/:key')
  setStock(
    @Param('key', new ZodValidationPipe(productKeySchema)) key: 'caneca' | 'camiseta',
    @Body(new ZodValidationPipe(stockSchema)) dto: StockDto,
  ) {
    return this.admin.setStock(key, dto.available);
  }

  @Post('work-orders')
  workOrders(
    @Body(new ZodValidationPipe(workOrderSchema)) dto: WorkOrderDto,
    @Res() res: Response,
  ) {
    return this.admin.streamWorkOrders(dto.productKey, dto.orderIds, res);
  }
}
