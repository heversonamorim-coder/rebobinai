import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './infra/sentry.filter';
import { initSentry } from './infra/sentry';

async function bootstrap() {
  // Observabilidade antes de tudo (no-op sem SENTRY_DSN).
  const sentryOn = initSentry();
  const app = await NestFactory.create(AppModule);
  // CORS multi-origem: WEB_URL aceita lista separada por vírgula (ex.: domínio
  // de produção + previews do Vercel). Barras finais são normalizadas.
  const origin = (process.env.WEB_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({ origin });
  // Filtro global que reporta erros 5xx ao Sentry (só quando ligado).
  if (sentryOn) {
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new SentryExceptionFilter(httpAdapter));
  }
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`◄◄ Rebobinaí API no ar em http://localhost:${port}${sentryOn ? ' · sentry on' : ''}`);
}

void bootstrap();
