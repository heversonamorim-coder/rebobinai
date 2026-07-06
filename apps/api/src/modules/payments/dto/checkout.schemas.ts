import { z } from 'zod';

/** Só planos pagos podem ir ao checkout (free não passa por aqui). */
const planKeySchema = z.enum(['digital', 'forever', 'quadro']);

const customerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  cpfCnpj: z.string().min(11).max(18), // CPF/CNPJ exigido pelo Asaas
});

const productSchema = z.enum(['caneca', 'camiseta']);
const sizeSchema = z.enum(['P', 'M', 'G', 'GG']);

/** Endereço de entrega do produto físico (plano "Lembrança física"). */
const shippingSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(10).max(20),
  cep: z.string().min(8).max(9),
  street: z.string().min(2).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(120).optional(),
  district: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  uf: z.string().min(2).max(2),
});

/**
 * Regras do plano físico: exige produto + endereço; caneca exige foto.
 * `.superRefine` roda depois do parse — só quando planKey === 'quadro'.
 */
function physicalRefine(
  data: { planKey: string; product?: string; photoAssetId?: string; size?: string; shipping?: unknown },
  ctx: z.RefinementCtx,
) {
  if (data.planKey !== 'quadro') return;
  if (!data.product) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['product'], message: 'Escolha um produto.' });
  }
  if (!data.shipping) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['shipping'], message: 'Informe o endereço de entrega.' });
  }
  if (data.product === 'caneca' && !data.photoAssetId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['photoAssetId'], message: 'Escolha a foto da caneca.' });
  }
  if (data.product === 'camiseta' && !data.size) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['size'], message: 'Escolha o tamanho da camiseta.' });
  }
}

export const pixCheckoutSchema = z
  .object({
    giftId: z.string().min(1),
    editToken: z.string().min(1),
    planKey: planKeySchema,
    customer: customerSchema,
    // Só usados no plano físico:
    product: productSchema.optional(),
    photoAssetId: z.string().max(60).optional(),
    size: sizeSchema.optional(),
    shipping: shippingSchema.optional(),
  })
  .superRefine(physicalRefine);

export const cardCheckoutSchema = z
  .object({
    giftId: z.string().min(1),
    editToken: z.string().min(1),
    planKey: planKeySchema,
    customer: customerSchema,
    product: productSchema.optional(),
    photoAssetId: z.string().max(60).optional(),
    size: sizeSchema.optional(),
    shipping: shippingSchema.optional(),
    card: z.object({
      holderName: z.string().min(2).max(120),
      number: z.string().min(13).max(19),
      expiryMonth: z.string().min(1).max(2),
      expiryYear: z.string().min(2).max(4),
      ccv: z.string().min(3).max(4),
    }),
    holder: z.object({
      postalCode: z.string().min(8).max(9),
      addressNumber: z.string().min(1).max(10),
      phone: z.string().min(10).max(15),
    }),
  })
  .superRefine(physicalRefine);

/** Cotação de frete por CEP (não passa pelo gateway). */
export const freightSchema = z.object({
  cep: z.string().min(8).max(9),
  product: productSchema,
});

export type PixCheckoutDto = z.infer<typeof pixCheckoutSchema>;
export type CardCheckoutDto = z.infer<typeof cardCheckoutSchema>;
export type FreightDto = z.infer<typeof freightSchema>;
export type ShippingDto = z.infer<typeof shippingSchema>;
