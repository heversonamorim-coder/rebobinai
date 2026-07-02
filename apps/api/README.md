# @rebobinai/api

Monólito modular NestJS. Bounded contexts em `src/modules/` — cada módulo é dono das próprias tabelas; comunicação entre módulos só por serviços exportados e eventos de domínio (outbox, tabela `OutboxEvent`).

## Dev local

```bash
docker compose up -d            # Postgres 16 + Redis 7 (na raiz do repo)
cp .env.example .env            # ajuste se necessário
pnpm prisma:migrate             # cria/aplica migrações no banco local
pnpm dev                        # api em http://localhost:3001 (GET /health)
```

Envs são validadas no boot (Zod, `src/infra/env.ts`) — a api falha rápido com mensagem clara se faltar variável obrigatória.

## Staging (Railway)

1. Crie um projeto no Railway e adicione os serviços **PostgreSQL** e **Redis** (um clique cada).
2. Crie o serviço da api apontando para este repo (root dir `apps/api`; build via Nixpacks/Dockerfile).
3. Em Variables da api, referencie `DATABASE_URL` e `REDIS_URL` dos serviços gerenciados e preencha as demais do `.env.example`.
4. Configure o comando de release/pre-deploy: `pnpm prisma:deploy` (roda `prisma migrate deploy` antes de subir).
5. Deploy: o Railway builda e sobe; confira `GET /health`.

## Cloudflare R2 (quando chegar em F3-3)

1. Painel Cloudflare → R2 → **Create bucket** (`rebobinai-media`).
2. R2 → Manage API Tokens → crie credenciais S3 (Access Key/Secret) com escopo no bucket.
3. Preencha `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` no ambiente.
