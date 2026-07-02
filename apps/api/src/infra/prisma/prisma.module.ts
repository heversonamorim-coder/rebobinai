import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global para injeção do client, MAS: cada bounded context define seus próprios
 * repositórios e consulta apenas as tabelas de que é dono. Nunca importe
 * repositório de outro módulo — use o serviço exportado ou eventos (outbox).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
