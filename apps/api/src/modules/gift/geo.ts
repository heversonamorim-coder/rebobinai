import { createHash } from 'node:crypto';

// geoip-lite não publica tipos; require tipado com o subset que usamos.
// Base offline: dá país + região (UF, quando disponível) + lat/lon.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const geoip = require('geoip-lite') as {
  lookup(ip: string): { country?: string; region?: string; city?: string; ll?: [number, number] } | null;
};

export interface GeoResult {
  country: string | null;
  region: string | null; // UF (sigla) — ex.: 'SP'
  city: string | null;
  lat: number | null;
  lon: number | null;
}

const EMPTY: GeoResult = { country: null, region: null, city: null, lat: null, lon: null };

/** Geolocaliza um IP no servidor (offline). Nunca lança; devolve nulos se falhar. */
export function geoLookup(ip: string | undefined): GeoResult {
  if (!ip) return EMPTY;
  const clean = ip.replace(/^::ffff:/, '').split(',')[0]?.trim();
  if (!clean) return EMPTY;
  try {
    const r = geoip.lookup(clean);
    if (!r) return EMPTY;
    return {
      country: r.country || null,
      region: r.region || null,
      city: r.city || null,
      lat: r.ll?.[0] ?? null,
      lon: r.ll?.[1] ?? null,
    };
  } catch {
    return EMPTY;
  }
}

/** Hash do IP por presente — permite contar únicos sem guardar o IP cru. */
export function hashIp(ip: string | undefined, giftId: string): string {
  return createHash('sha256')
    .update(`${ip ?? 'unknown'}:${giftId}`)
    .digest('hex');
}

/** Dia no fuso do Brasil (America/Sao_Paulo) como 'YYYY-MM-DD'. */
export function brDay(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/** IP real do cliente — Railway/proxy setam X-Forwarded-For (1º hop). */
export function clientIp(forwarded: string | undefined, fallback: string | undefined): string | undefined {
  const first = forwarded?.split(',')[0]?.trim();
  return first || fallback;
}

/**
 * Planos que incluem o analytics do presente ("Analytics de aberturas").
 * 'forever' (Pra Sempre) e 'quadro' (Lembrança física, que tem "Tudo do Pra
 * Sempre").
 */
const ANALYTICS_PLANS = new Set(['forever', 'quadro']);
export function planHasAnalytics(planKey: string | null | undefined): boolean {
  return Boolean(planKey && ANALYTICS_PLANS.has(planKey));
}
