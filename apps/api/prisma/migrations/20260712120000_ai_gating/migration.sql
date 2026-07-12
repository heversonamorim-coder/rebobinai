-- Gating da IA (freemium + trava do plano) + rename do plano físico.

-- Flag "usou o compositor de IA" no presente. Trava o Digital no checkout:
-- presente montado com IA só pode ser vendido em plano que inclui IA
-- (Pra Sempre / +Lembrança Física).
ALTER TABLE "Gift" ADD COLUMN "composedWithAi" BOOLEAN NOT NULL DEFAULT false;

-- Cota anti-abuso do compositor de IA — por IP (hash) e por dia (fuso BR).
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiUsage_ipHash_day_key" ON "AiUsage"("ipHash", "day");

-- Copy: "+Lembrança física" passa a se chamar "+ Lembrança Física" (só o rótulo
-- exibido; a chave interna PlanKey 'quadro' permanece). "IA compositor" vira
-- "IA ilimitada" no Pra Sempre (o freemium libera uma prova limitada a todos).
UPDATE "Plan" SET "name" = '+ Lembrança Física' WHERE "key" = 'quadro';
UPDATE "Plan"
SET "features" = ARRAY['Tudo do Digital', 'Vitalício', 'IA ilimitada', 'Analytics de aberturas', 'Mais fotos']
WHERE "key" = 'forever';
