#!/usr/bin/env node
/**
 * Rebobinaí ◄◄ — gera a migração de seed do lote 2 (20 exemplos) a partir de
 * lote2-data.mjs, no padrão da 20260707120000_example_1095_dias:
 * INSERT idempotente em "Example" com ON CONFLICT ("seoSlug") DO UPDATE.
 *
 * Saída: apps/api/prisma/migrations/20260712180000_examples_galeria_lote2/migration.sql
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXAMPLES, R2_BASE } from './lote2-data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '..', 'apps', 'api', 'prisma', 'migrations', '20260712180000_examples_galeria_lote2');

// Moderação básica (consistência com a regra global) — bloqueia termos proibidos.
const BLOCKLIST = /\b(nude|nudes|pelad[ao]s?|pornô?|explícit[ao]|assédio|cpf \d|rg \d)\b/i;

const sqlEscape = (s) => s.replace(/'/g, "''");

const rows = EXAMPLES.map((ex) => {
  // assets: uma foto por entrada, id ph_<n>, order = posição no array
  const assets = ex.photos.map((p, i) => {
    const key = `seed/exemplos/${ex.slug}/${p.n}.png`;
    return { id: `ph_${p.n}`, type: 'image', r2Key: key, url: `${R2_BASE}/${key}`, order: i };
  });

  // timeline: injeta photoAssetId conforme o mapeamento foto→momento
  const timeline = ex.timeline.map((item, idx) => {
    const photo = ex.photos.find((p) => p.tl === idx + 1);
    return photo ? { ...item, photoAssetId: `ph_${photo.n}` } : item;
  });

  const payload = {
    title: ex.title,
    recipientName: ex.recipient,
    senderName: ex.sender,
    ...(ex.counter && { counter: ex.counter }),
    assets,
    timeline,
    stats: ex.stats,
    letter: ex.letter,
    ...(ex.closing && { closingMessage: ex.closing }),
    theme: 'vhs',
  };

  // validações estruturais (limites do gift.schemas.ts)
  const errs = [];
  if (payload.title.length > 160) errs.push('title>160');
  if (payload.letter.length > 8000) errs.push('letter>8000');
  for (const t of timeline) {
    if (t.title.length > 160) errs.push(`tl title>160: ${t.title}`);
    if ((t.description ?? '').length > 2000) errs.push('tl desc>2000');
  }
  for (const s of ex.stats) {
    if (s.label.length > 120) errs.push(`stat label>120: ${s.label}`);
    if (!s.auto && typeof s.value !== 'number') errs.push(`stat sem value numérico: ${s.label}`);
  }
  const orphan = ex.photos.filter((p) => p.tl && p.tl > ex.timeline.length);
  if (orphan.length) errs.push(`foto aponta pra momento inexistente: ${JSON.stringify(orphan)}`);
  const hit = JSON.stringify(payload).match(BLOCKLIST);
  if (hit) errs.push(`moderação: "${hit[0]}"`);
  if (errs.length) throw new Error(`${ex.slug}: ${errs.join(' · ')}`);

  const id = `ex_${ex.slug.replace(/-/g, '_')}`;
  return `  ('${id}', '${sqlEscape(ex.persona)}', '${sqlEscape(ex.name)}', '${ex.occasion}',\n   '${sqlEscape(JSON.stringify(payload))}'::jsonb,\n   '${ex.slug}', ${ex.sortOrder}, true, CURRENT_TIMESTAMP)`;
});

const sql = `-- Seed idempotente do lote 2 da galeria de exemplos (F2-5): os 20 exemplos
-- restantes de docs/EXEMPLOS-REBOBINADAS.md (6 temas × 4, menos os 4 já
-- seedados). Payload no schema do Gift.payload; fotos no R2 em
-- seed/exemplos/<slug>/<n>.png, associadas aos momentos via photoAssetId.
-- Upsert por seoSlug: re-aplicar atualiza o conteúdo sem duplicar.
INSERT INTO "Example" ("id", "persona", "name", "occasion", "payload", "seoSlug", "sortOrder", "active", "createdAt") VALUES
${rows.join(',\n')}
ON CONFLICT ("seoSlug") DO UPDATE SET
  "persona" = EXCLUDED."persona",
  "name" = EXCLUDED."name",
  "occasion" = EXCLUDED."occasion",
  "payload" = EXCLUDED."payload",
  "sortOrder" = EXCLUDED."sortOrder",
  "active" = EXCLUDED."active";
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'migration.sql'), sql);
console.log(`✔ ${EXAMPLES.length} exemplos → ${join(outDir, 'migration.sql')} (${sql.length} bytes)`);
