import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Sentry } from './sentry';

/**
 * Filtro global que reporta ao Sentry qualquer erro 5xx (inclui a falha ao
 * criar um presente — se o createDraft explodir, o operador fica sabendo).
 * Mantém a resposta HTTP padrão do Nest via BaseExceptionFilter.
 */
@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    // Só erros de servidor viram alerta — 4xx (validação, não autorizado) não.
    if (status >= 500) {
      const req = host.switchToHttp().getRequest<{ method?: string; url?: string }>();
      Sentry.captureException(exception, {
        tags: { route: `${req?.method ?? '?'} ${req?.url ?? '?'}` },
      });
    }
    super.catch(exception, host);
  }
}
