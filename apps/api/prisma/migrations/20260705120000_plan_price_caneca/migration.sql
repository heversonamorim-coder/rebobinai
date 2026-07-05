-- Ajuste do plano físico: "a partir de R$ 69,90" (preço da caneca, o produto
-- mais barato). O valor final continua dependendo do produto + frete.
UPDATE "Plan"
SET
  "fullPrice" = 6990,
  "launchPrice" = 6990,
  "features" = ARRAY['Tudo do Pra Sempre', 'Caneca ou camiseta com QR', 'A partir de R$ 69,90 + frete']
WHERE "key" = 'quadro';
