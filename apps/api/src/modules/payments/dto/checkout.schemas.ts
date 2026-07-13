import { z } from 'zod';

/** Só planos pagos podem ir ao checkout (free não passa por aqui). */
const planKeySchema = z.enum(['digital', 'forever', 'quadro']);

// ---------------------------------------------------------------------------
// Validação de dígitos verificadores de CPF e CNPJ
// ---------------------------------------------------------------------------

/** Valida CPF com dígitos verificadores (algoritmo padrão da Receita Federal). */
function validCpf(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 11) return false;
  // Rejeita sequências de dígitos iguais (ex.: 000.000.000-00)
  if (/^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  const r1 = sum % 11;
  const dig1 = r1 < 2 ? 0 : 11 - r1;
  if (Number(d[9]) !== dig1) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  const r2 = sum % 11;
  const dig2 = r2 < 2 ? 0 : 11 - r2;
  return Number(d[10]) === dig2;
}

/** Valida CNPJ com dígitos verificadores (algoritmo padrão da Receita Federal). */
function validCnpj(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 14) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(d[i]) * (w1[i] as number);
  const r1 = sum % 11;
  const dig1 = r1 < 2 ? 0 : 11 - r1;
  if (Number(d[12]) !== dig1) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) sum += Number(d[i]) * (w2[i] as number);
  const r2 = sum % 11;
  const dig2 = r2 < 2 ? 0 : 11 - r2;
  return Number(d[13]) === dig2;
}

/** Valida CPF (11 dígitos) ou CNPJ (14 dígitos) com dígito verificador. */
function validCpfOrCnpj(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) return validCpf(raw);
  if (digits.length === 14) return validCnpj(raw);
  return false;
}

const customerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  // CPF/CNPJ exigido pelo Asaas — validado com dígito verificador.
  cpfCnpj: z
    .string()
    .min(11)
    .max(18)
    .refine(validCpfOrCnpj, { message: 'CPF ou CNPJ inválido' }),
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
