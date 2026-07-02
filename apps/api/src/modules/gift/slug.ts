import { randomBytes } from 'node:crypto';

// Alfabeto sem caracteres ambíguos (0/O, 1/l/I) — slug curto e legível.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/** Gera um slug público curto e não sequencial (ex.: "k7mq2xa"). */
export function generateSlug(length = 7): string {
  const bytes = randomBytes(length);
  let out = '';
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return out;
}
