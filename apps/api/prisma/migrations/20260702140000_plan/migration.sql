-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('free', 'digital', 'forever', 'quadro');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "key" "PlanKey" NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "fullPrice" INTEGER NOT NULL,
    "launchPrice" INTEGER NOT NULL,
    "launchEndsAt" TIMESTAMP(3),
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- Seed dos planos (preços em centavos). launchEndsAt nulo: mostra "preço de
-- lançamento" sem afirmar prazo até uma data real ser definida (compliance CDC).
INSERT INTO "Plan" ("id", "key", "name", "tagline", "fullPrice", "launchPrice", "launchEndsAt", "features", "active", "sortOrder", "createdAt", "updatedAt") VALUES
  ('plan_free', 'free', 'Grátis', 'Crie e veja a prévia', 0, 0, NULL, ARRAY['Criar e ver a prévia', 'Com marca d''água', 'Sem link compartilhável'], true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_digital', 'digital', 'Digital', 'O presente no ar', 2490, 1990, NULL, ARRAY['Link + QR code', 'Música e fotos', 'Hospedagem por 1 ano', 'Sem marca d''água'], true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_forever', 'forever', 'Pra Sempre', 'Vitalício, com IA', 3990, 2990, NULL, ARRAY['Tudo do Digital', 'Vitalício', 'IA compositor', 'Analytics de aberturas', 'Mais fotos'], true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_quadro', 'quadro', '+ Quadro', 'O presente na parede', 14900, 11900, NULL, ARRAY['Tudo do Pra Sempre', 'Quadro impresso com QR', 'Frete à parte'], true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
