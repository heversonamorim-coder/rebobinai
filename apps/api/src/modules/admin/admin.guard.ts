import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Protege os endpoints /admin com um token compartilhado (ADMIN_API_TOKEN),
 * enviado no header `x-admin-token`. Quem fala com a API é o servidor do site
 * (rota /admin), que só chama depois de validar usuário/senha do operador.
 * Sem o token configurado, o admin fica desabilitado (401) — gated service.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('ADMIN_API_TOKEN');
    if (!expected) throw new UnauthorizedException('Admin não configurado.');
    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers['x-admin-token'];
    if (provided !== expected) throw new UnauthorizedException('Token de admin inválido.');
    return true;
  }
}
