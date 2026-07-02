# Rebobinaí ◄◄

[![CI](https://github.com/heversonamorim-coder/rebobinai/actions/workflows/ci.yml/badge.svg)](https://github.com/heversonamorim-coder/rebobinai/actions/workflows/ci.yml)

Presentes digitais que rebobinam a sua história — feitos com IA.

Monorepo (Turborepo + pnpm):

| Workspace | O quê | Porta |
| --- | --- | --- |
| `apps/web` | Next.js (App Router + TS + Tailwind) — landing, editor, /p/:slug | 3000 |
| `apps/api` | NestJS — monólito modular (bounded contexts em `src/modules/`) | 3001 |
| `packages/ui` | Design tokens da marca + componentes compartilhados | — |

## Bootstrap

```bash
corepack enable        # habilita pnpm (Node >= 22)
pnpm install
pnpm dev               # web em :3000, api em :3001 (GET /health)
```

`pnpm build` · `pnpm lint` · `pnpm test`

## Arquitetura

Monólito modular: cada módulo em `apps/api/src/modules/` é um bounded context (gift, payments, promotions, accounts, analytics, ai, media, gallery, notifications). Módulos não acessam tabelas uns dos outros — comunicação por serviços internos e eventos de domínio (padrão outbox: `gift.paid`, `gift.viewed`, `coupon.redeemed`).

Fonte de verdade do projeto: `PROJETO-REBOBINAI.md` (Google Drive). Guia de marca: `rebobinai-marca.html`.

## CI/CD

Fluxo: **PR → CI (lint + test + build) → merge na `main` → deploy automático**.

- **CI**: GitHub Actions (`.github/workflows/ci.yml`) roda `turbo run lint test build` em todo PR e push na `main`.
- **Web (Vercel)**: conectar o repo no painel da Vercel com **Root Directory = `apps/web`** (framework Next.js é detectado; pnpm workspaces suportado nativamente). Deploy automático na `main` + previews por PR.
- **API (Railway)**: conectar o repo no painel do Railway; o `railway.json` na raiz já define build (`pnpm --filter @rebobinai/api build`), pre-deploy (`prisma migrate deploy`), start e healthcheck `/health`. Vincule os serviços Postgres e Redis às envs (`DATABASE_URL`, `REDIS_URL`) e preencha as demais do `apps/api/.env.example`.
- **Proteção de branch**: em Settings → Branches, exija o check "Lint · Test · Build" verde antes de merge na `main`.
