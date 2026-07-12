#!/usr/bin/env node
/**
 * Rebobinaí ◄◄ — gera as fotos dos exemplos da galeria via Nano Banana 2
 * (Gemini API, modelo gemini-3.1-flash-image).
 *
 * - Lê scripts/seed-examples/manifest.json (24 exemplos, 105 prompts).
 * - Foto 1 de cada set é gerada do prompt; fotos 2+ recebem a foto 1 como
 *   referência para manter os MESMOS personagens (consistência nativa do modelo).
 * - Idempotente: pula arquivos que já existem em seed-assets/<slug>/<n>.png.
 *   (Fotos que você já gerou na mão: salve com esse nome que o script pula.)
 * - Sequencial + retry com backoff (respeita rate limit).
 *
 * Uso:
 *   GEMINI_API_KEY=... node scripts/seed-examples/generate-images.mjs [--only <slug>] [--dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, 'manifest.json'), 'utf8'));
const OUT_DIR = join(here, '..', '..', 'seed-assets');
const API_KEY = process.env.GEMINI_API_KEY;
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const DRY = process.argv.includes('--dry-run');

if (!API_KEY && !DRY) {
  console.error('Defina GEMINI_API_KEY (https://aistudio.google.com → Get API key).');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Acha recursivamente o primeiro bloco de imagem (base64) na resposta. */
function findImage(node) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'image' && typeof node.data === 'string' && node.data.length > 1000) return node.data;
  if (typeof node.inlineData?.data === 'string') return node.inlineData.data;
  for (const v of Array.isArray(node) ? node : Object.values(node)) {
    const found = findImage(v);
    if (found) return found;
  }
  return null;
}

async function generate({ prompt, referencePng }) {
  const input = [{ type: 'text', text: prompt }];
  if (referencePng) {
    input.push({ type: 'image', data: referencePng.toString('base64'), mime_type: 'image/png' });
  }
  const body = {
    model: manifest.model,
    input,
    response_format: { type: 'image', aspect_ratio: manifest.aspectRatio, image_size: manifest.imageSize },
  };

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'x-goog-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = attempt * 15000;
      console.warn(`  HTTP ${res.status} — tentativa ${attempt}/4, aguardando ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const json = await res.json();
    const b64 = findImage(json);
    if (!b64) throw new Error(`Resposta sem imagem: ${JSON.stringify(json).slice(0, 400)}`);
    return Buffer.from(b64, 'base64');
  }
  throw new Error('Rate limit persistente após 4 tentativas.');
}

let done = 0, skipped = 0, failed = 0;

for (const ex of manifest.examples) {
  if (ONLY && ex.slug !== ONLY) continue;
  const dir = join(OUT_DIR, ex.slug);
  mkdirSync(dir, { recursive: true });
  console.log(`\n◄◄ ${ex.slug} (${ex.prompts.length} fotos) — ${ex.characters}`);

  let reference = null; // foto 1 do set vira referência das demais
  for (let i = 0; i < ex.prompts.length; i++) {
    const file = join(dir, `${i + 1}.png`);
    const refNote = i > 0
      ? ' Use the exact same people from the reference image as the same characters, aged as described.'
      : '';
    const prompt = `${ex.prompts[i]} ${manifest.globalStyle}${refNote}`;

    if (existsSync(file)) {
      skipped++;
      console.log(`  ${i + 1}.png já existe — pulando`);
      if (!reference) reference = readFileSync(file); // aproveita como referência
      continue;
    }
    if (DRY) { console.log(`  ${i + 1}.png → [dry-run] ${prompt.slice(0, 90)}...`); continue; }

    try {
      const png = await generate({ prompt, referencePng: reference });
      writeFileSync(file, png);
      if (!reference) reference = png;
      done++;
      console.log(`  ${i + 1}.png ✔ (${Math.round(png.length / 1024)} KB)`);
      await sleep(3000); // folga entre chamadas
    } catch (err) {
      failed++;
      console.error(`  ${i + 1}.png ✖ ${err.message}`);
    }
  }
}

console.log(`\nGeradas: ${done} · puladas: ${skipped} · falhas: ${failed}`);
console.log(`Saída: ${OUT_DIR}/<slug>/<n>.png`);
if (failed) process.exit(1);
