#!/usr/bin/env node
/**
 * Rebobinaí ◄◄ — sobe as fotos de seed-assets/ para o Cloudflare R2.
 *
 * Chaves: seed/exemplos/<slug>/<n>.png (padrão já referenciado no
 * docs/EXEMPLOS-REBOBINADAS.md e esperado pelo seed do F2-5).
 *
 * Idempotente: HEAD antes de PUT; só envia o que falta.
 *
 * Uso (envs iguais às do apps/api/.env):
 *   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=rebobinai-media \
 *   node scripts/seed-examples/upload-r2.mjs [--dry-run]
 *
 * Dependência (raiz do monorepo): pnpm add -w @aws-sdk/client-s3
 */
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(here, '..', '..', 'seed-assets');
const DRY = process.argv.includes('--dry-run');

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (!DRY && (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET)) {
  console.error('Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_BUCKET.');
  process.exit(1);
}
if (!existsSync(ASSETS)) {
  console.error(`Nada em ${ASSETS} — rode generate-images.mjs antes.`);
  process.exit(1);
}

const s3 = DRY ? null : new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

let uploaded = 0, skipped = 0;

for (const slug of readdirSync(ASSETS)) {
  const dir = join(ASSETS, slug);
  for (const file of readdirSync(dir).filter((f) => /\.(png|webp|jpe?g)$/i.test(f))) {
    const key = `seed/exemplos/${slug}/${file}`;
    if (DRY) { console.log(`[dry-run] ${key}`); continue; }

    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      skipped++;
      continue; // já existe
    } catch { /* não existe — sobe */ }

    const ext = file.split('.').pop().toLowerCase();
    const contentType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: readFileSync(join(dir, file)),
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    uploaded++;
    console.log(`↑ ${key}`);
  }
}

console.log(`\nEnviadas: ${uploaded} · já existiam: ${skipped}`);
