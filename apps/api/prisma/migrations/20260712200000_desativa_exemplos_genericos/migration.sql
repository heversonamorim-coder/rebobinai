-- Desativa os 4 exemplos genéricos do seed inicial (20260702160000), substituídos
-- pelos 24 exemplos completos de docs/EXEMPLOS-REBOBINADAS.md (com fotos, contador,
-- timeline e carta). Desativar em vez de deletar: reversível (active=true) e não
-- quebra rascunhos que porventura tenham sido clonados deles. Idempotente.
UPDATE "Example"
SET "active" = false
WHERE "seoSlug" IN (
  'presente-namorada',
  'presente-dia-dos-pais',
  'presente-melhores-amigas',
  'presente-casamento'
);
