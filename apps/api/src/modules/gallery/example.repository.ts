import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

/** Único ponto que toca a tabela Example (bounded context gallery). */
@Injectable()
export class ExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.example.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.example.findUnique({ where: { id } });
  }
}
