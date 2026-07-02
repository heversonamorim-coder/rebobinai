import { z } from 'zod';

/**
 * Schemas de entrada do módulo gift. O `payload` é o conteúdo do presente
 * (a "rebobinada"). É propositalmente aberto (`.passthrough()`) para o editor
 * multi-step (F1-2) e a IA (F3-1) evoluírem os campos sem quebrar contrato.
 */

export const timelineItemSchema = z.object({
  date: z.string().max(120).optional(), // texto livre: "2019", "nosso 1º date"
  title: z.string().max(160),
  description: z.string().max(2000).optional(),
});

export const giftPayloadSchema = z
  .object({
    title: z.string().max(160).optional(),
    recipientName: z.string().max(120).optional(),
    senderName: z.string().max(120).optional(),
    letter: z.string().max(8000).optional(),
    timeline: z.array(timelineItemSchema).max(50).optional(),
    theme: z.string().max(60).optional(),
    spotifyTrackUrl: z.string().url().max(500).optional(),
  })
  .passthrough();

export const createGiftSchema = z.object({
  occasion: z.string().max(60).optional(),
  payload: giftPayloadSchema.optional(),
});

export const updateGiftSchema = z.object({
  occasion: z.string().max(60).nullish(),
  payload: giftPayloadSchema.optional(),
});

export const addAssetSchema = z.object({
  type: z.enum(['image', 'audio']),
  r2Key: z.string().min(1).max(500),
  order: z.number().int().min(0).max(1000).optional(),
});

export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type GiftPayload = z.infer<typeof giftPayloadSchema>;
export type CreateGiftDto = z.infer<typeof createGiftSchema>;
export type UpdateGiftDto = z.infer<typeof updateGiftSchema>;
export type AddAssetDto = z.infer<typeof addAssetSchema>;
