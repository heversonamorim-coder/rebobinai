import { z } from 'zod';

/**
 * Mensagem do "fale conosco" (rodapé). Campos preenchidos pelo próprio cliente;
 * limites generosos mas finitos pra evitar abuso. A leitura é feita no admin.
 */
export const createContactSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(120),
  email: z.string().trim().email('E-mail inválido').max(180),
  message: z.string().trim().min(1, 'Escreva sua mensagem').max(4000),
});

export type CreateContactDto = z.infer<typeof createContactSchema>;
