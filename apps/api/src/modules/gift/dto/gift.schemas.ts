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
  // Foto opcional do momento — referencia um GiftAsset já enviado (id no cuid).
  photoAssetId: z.string().max(60).optional(),
});

/** Contador de dias — data neutra (nunca assume casal) + label editável. */
export const counterSchema = z.object({
  targetDate: z.string().max(40).optional(), // ISO "2019-03-14"
  label: z.string().max(80).optional(),
});

/**
 * Card do "Os números de vocês" (wrapped). Auto = derivado da data do contador
 * (NÃO guarda value; é sempre calculado no render). Manual = value/suffix/label.
 * Sufixos não numéricos (ex.: "∞") são permitidos.
 */
export const statSchema = z.object({
  auto: z.literal('days_since_counter').optional(),
  value: z.number().optional(),
  suffix: z.string().max(40).optional(),
  label: z.string().max(120),
});

export const giftPayloadSchema = z
  .object({
    title: z.string().max(160).optional(),
    recipientName: z.string().max(120).optional(),
    senderName: z.string().max(120).optional(),
    letter: z.string().max(8000).optional(),
    timeline: z.array(timelineItemSchema).max(50).optional(),
    counter: counterSchema.optional(),
    stats: z.array(statSchema).max(30).optional(),
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
