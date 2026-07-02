import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS multi-origem: WEB_URL aceita lista separada por vírgula (ex.: domínio
  // de produção + previews do Vercel). Barras finais são normalizadas.
  const origin = (process.env.WEB_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({ origin });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`◄◄ Rebobinaí API no ar em http://localhost:${port}`);
}

void bootstrap();
