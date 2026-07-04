-- Tarefa 5 — plano "+Lembrança física" com produto físico (caneca/camiseta).

-- Campos de fulfillment no pedido (nulos em planos digitais).
ALTER TABLE "Order" ADD COLUMN "productKey" TEXT;
ALTER TABLE "Order" ADD COLUMN "photoAssetId" TEXT;
ALTER TABLE "Order" ADD COLUMN "shipping" JSONB;
ALTER TABLE "Order" ADD COLUMN "shippingCost" INTEGER;
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippedAt" TIMESTAMP(3);

-- Renomeia o antigo "+ Quadro" para "+Lembrança física". A chave interna
-- (PlanKey 'quadro') permanece estável; muda só o que o cliente vê. O preço
-- vira "a partir de R$ 49,90" (o valor final depende do produto escolhido).
UPDATE "Plan"
SET
  "name" = '+Lembrança física',
  "tagline" = 'Uma lembrança física com QR',
  "fullPrice" = 4990,
  "launchPrice" = 4990,
  "features" = ARRAY['Tudo do Pra Sempre', 'Caneca ou camiseta com QR', 'A partir de R$ 49,90 + frete']
WHERE "key" = 'quadro';
