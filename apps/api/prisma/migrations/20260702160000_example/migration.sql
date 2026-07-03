-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occasion" TEXT,
    "payload" JSONB NOT NULL,
    "seoSlug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Example_seoSlug_key" ON "Example"("seoSlug");

-- CreateIndex
CREATE INDEX "Example_active_sortOrder_idx" ON "Example"("active", "sortOrder");

-- Seed de exemplos por persona (base pra clonar — F2-5).
INSERT INTO "Example" ("id", "persona", "name", "occasion", "payload", "seoSlug", "sortOrder", "active", "createdAt") VALUES
  ('ex_namorada', 'namorada', 'Pra namorada', 'namorada',
   '{"title":"4 anos rebobinando a gente","recipientName":"Marina","senderName":"João","letter":"Do primeiro oi no busão ao apê que virou nosso — cada capítulo com você foi meu favorito. Aperta o play que eu rebobino tudo de novo.","timeline":[{"date":"2021","title":"O primeiro date","description":"Café que virou 4 horas de conversa."},{"date":"2022","title":"Primeira viagem","description":"Praia, chuva e a gente rindo à toa."},{"date":"2024","title":"Nosso cantinho","description":"As chaves do primeiro apê."}],"theme":"vhs"}'::jsonb,
   'presente-namorada', 0, true, CURRENT_TIMESTAMP),
  ('ex_pai', 'pai', 'Pro pai', 'pai',
   '{"title":"Pro melhor pai do mundo","recipientName":"Seu Antônio","senderName":"seus filhos","letter":"Você ensinou a andar de bike, a trocar pneu e a nunca desistir. Hoje a gente rebobina pra dizer: obrigado por tudo, pai.","timeline":[{"date":"1995","title":"As voltas de bike","description":"Segurando o banco até eu conseguir sozinho."},{"date":"2010","title":"A viagem só nós dois","description":"Estrada, música e causos."},{"date":"2024","title":"Vovô chegando","description":"O ciclo continua."}],"theme":"vhs"}'::jsonb,
   'presente-dia-dos-pais', 1, true, CURRENT_TIMESTAMP),
  ('ex_amigas', 'amigas', 'Pras amigas', 'amigas',
   '{"title":"Amigas desde sempre","recipientName":"as gurias","senderName":"Duda","letter":"15 anos de rolê, choro, risada e áudio de 8 minutos. Que a gente rebobine muito mais.","timeline":[{"date":"2009","title":"A sala do fundão","description":"Onde tudo começou."},{"date":"2016","title":"A formatura","description":"Choramos horrores."},{"date":"2023","title":"A viagem das amigas","description":"O grupo que virou família."}],"theme":"vhs"}'::jsonb,
   'presente-melhores-amigas', 2, true, CURRENT_TIMESTAMP),
  ('ex_casamento', 'casamento', 'Pro casamento', 'casamento',
   '{"title":"O nosso pra sempre","recipientName":"Bia & Rafa","senderName":"com amor","letter":"De um match a um altar. Toda história de amor merece um replay — e a de vocês é das boas.","timeline":[{"date":"2019","title":"O match","description":"Um like que mudou tudo."},{"date":"2022","title":"O pedido","description":"Joelho no chão, sim aos prantos."},{"date":"2025","title":"O sim","description":"Pra sempre começa agora."}],"theme":"vhs"}'::jsonb,
   'presente-casamento', 3, true, CURRENT_TIMESTAMP);
