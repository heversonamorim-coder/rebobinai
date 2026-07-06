import { Body, Controller, Get, Ip, Param, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import {
  CardCheckoutDto,
  FreightDto,
  PixCheckoutDto,
  cardCheckoutSchema,
  freightSchema,
  pixCheckoutSchema,
} from './dto/checkout.schemas';
import { PaymentsService } from './payments.service';
import { PHYSICAL_PRODUCTS } from './products';
import { StockService } from './stock.service';

/** Checkout transparente (F1-5): Pix (QR inline) e cartão. */
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly stock: StockService,
  ) {}

  @Post('pix')
  pix(@Body(new ZodValidationPipe(pixCheckoutSchema)) dto: PixCheckoutDto) {
    return this.payments.checkoutPix(dto);
  }

  @Post('card')
  card(@Body(new ZodValidationPipe(cardCheckoutSchema)) dto: CardCheckoutDto, @Ip() ip: string) {
    return this.payments.checkoutCard(dto, ip);
  }

  @Get('orders/:id')
  orderStatus(@Param('id') id: string) {
    return this.payments.getOrderStatus(id);
  }

  /** Catálogo de produtos físicos + disponibilidade de estoque (Tarefa 8). */
  @Get('products')
  async products() {
    const avail = await this.stock.availabilityMap();
    return Object.values(PHYSICAL_PRODUCTS).map((p) => ({ ...p, available: avail[p.key] }));
  }

  /** Cotação de frete por CEP + total do produto (não passa pelo gateway). */
  @Post('freight')
  freight(@Body(new ZodValidationPipe(freightSchema)) dto: FreightDto) {
    return this.payments.quoteFreight(dto);
  }
}
