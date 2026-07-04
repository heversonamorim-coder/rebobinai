import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';

/**
 * Bounded context: media. Dono do pipeline de imagem e do storage (Cloudflare
 * R2, S3-compatível). O banco guarda apenas o r2Key (o dono do GiftAsset é o
 * módulo gift). Sem as credenciais R2 o upload responde 503 e o resto sobe.
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly client?: S3Client;
  private readonly bucket?: string;
  private readonly publicBase: string;

  constructor(config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET');
    this.publicBase = (config.get<string>('R2_PUBLIC_BASE_URL') ?? '').replace(/\/+$/, '');

    if (accountId && accessKeyId && secretAccessKey && this.bucket) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  get enabled(): boolean {
    return Boolean(this.client && this.bucket);
  }

  publicUrl(r2Key: string): string {
    return `${this.publicBase}/${r2Key}`;
  }

  /**
   * Otimiza a imagem (auto-orienta por EXIF, redimensiona até 1600px, converte
   * para WebP) e envia ao R2. Devolve a chave e a URL pública.
   */
  async uploadImage(buffer: Buffer): Promise<{ r2Key: string; url: string }> {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException('Upload indisponível: R2 não configurado.');
    }
    const webp = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const r2Key = `gifts/${randomBytes(16).toString('hex')}.webp`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: r2Key,
        Body: webp,
        ContentType: 'image/webp',
      }),
    );
    return { r2Key, url: this.publicUrl(r2Key) };
  }
}
