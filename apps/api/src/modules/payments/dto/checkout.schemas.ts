import { z } from 'zod';

/** Só planos pagos podem ir ao checkout (free não passa por aqui). */
const planKeySchema = z.enum(['digital', 'forever', 'quadro']);

const customerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  cpfCnpj: z.string().min(11).max(18), // CPF/CNPJ exigido pelo Asaas
});

export const pixCheckoutSchema = z.object({
  giftId: z.string().min(1),
  editToken: z.string().min(1),
  planKey: planKeySchema,
  customer: customerSchema,
});

export const cardCheckoutSchema = pixCheckoutSchema.extend({
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
});

export type PixCheckoutDto = z.infer<typeof pixCheckoutSchema>;
export type CardCheckoutDto = z.infer<typeof cardCheckoutSchema>;
