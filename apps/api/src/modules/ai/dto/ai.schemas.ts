import { z } from 'zod';

/** Entrada do compositor: um parágrafo contando a história. */
export const draftInputSchema = z.object({
  text: z.string().min(10).max(4000),
});

export type DraftInputDto = z.infer<typeof draftInputSchema>;

/** Saída esperada do modelo (validada antes de devolver). */
export const aiDraftSchema = z.object({
  title: z.string(),
  occasion: z.string().nullable(),
  recipientName: z.string().nullable(),
  senderName: z.string().nullable(),
  letter: z.string(),
  timeline: z
    .array(
      z.object({
        date: z.string().nullable(),
        title: z.string(),
        description: z.string().nullable(),
      }),
    )
    .max(12),
});

export type AiDraft = z.infer<typeof aiDraftSchema>;
