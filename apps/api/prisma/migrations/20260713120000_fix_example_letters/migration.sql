-- Corrige o campo 'letter' dos exemplos da galeria para respeitar o limite
-- de 200 caracteres do editor (maxLength={200} no criar/page.tsx).
-- Todos os textos foram aparados mantendo o gancho emocional da abertura.

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Bruno, a gente começou contando quilômetros e hoje conta só os dias — e olha que número bonito deu. Obrigada por cada ônibus lotado e por ter feito da distância uma fase e não uma desculpa."')
WHERE "seoSlug" = 'ex_namoro_1095';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Pai, mãe: a gente cresceu achando que todo casal era assim — café um pro outro, dancinha na cozinha quando acham que ninguém vê. Demorou pra entender que isso é raro. Vinte e cinco anos. Que raridade."')
WHERE "seoSlug" = 'ex_bodas_prata';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Mãe, demorei a vida inteira pra entender que ''já comeu?'' significa ''eu te amo mais do que sei dizer''. Que sopa em pote de sorvete é declaração. Você me ensinou amor sem cobrar nada."')
WHERE "seoSlug" = 'ex_maes_ja_comeu';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Rê, todo mundo ri quando conta que a gente veio de um aplicativo. Eu também rio — de sorte. No meio de mil perfis, achei a única pessoa que faz silêncio virar lugar confortável."')
WHERE "seoSlug" = 'ex_namoro_do_match';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Ícaro, faz um ano que a gente estragou uma amizade perfeitamente boa — e foi a melhor decisão que já tomamos. Um ano de primeiras vezes — e eu aprendi que te amo escapa sozinho quando é de verdade."')
WHERE "seoSlug" = 'ex_namoro_primeiro_ano';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Paula, quatro anos e eu ainda não sei o que amo mais: acordar com você ou com a Nina pisando na minha cara às 6h. Mentira, sei sim. Obrigado por transformar nosso apartamento em lar com pelo no sofá."')
WHERE "seoSlug" = 'ex_namoro_a_gente_e_a_nina';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Tom, um ano atrás sua voz falhou no altar e eu entendi tudo que você não conseguiu falar. Mais boleto que lua de mel, mais rotina que festa — e ainda assim foi a coisa mais certa que eu já fiz."')
WHERE "seoSlug" = 'ex_casamento_primeiro_ano';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Dani, dez anos atrás eu prometi te amar na alegria e na tristeza. Ninguém avisou da terceira opção: na exaustão. E olha que descoberta — é nela que eu mais te amo."')
WHERE "seoSlug" = 'ex_casamento_de_2_viramos_4';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Vó, vô: metade da família nem tinha nascido quando vocês já eram história. A gente cresceu ouvindo do baile, da sanfona e do pão que sustentou quatro filhos — e aprendendo com o amor de vocês."')
WHERE "seoSlug" = 'ex_casamento_bodas_ouro';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Pai, eu ainda não sei falar, então a mamãe está escrevendo. Ela mandou dizer que te ver comigo no colo é a coisa mais bonita que ela já viu — e ela viu o mar."')
WHERE "seoSlug" = 'ex_pais_primeiro_dia';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Pai, você nunca me cobrou gol. Me cobrou caráter. Aprendi a perder no futebol e a ganhar na vida ouvindo você narrar meus erros como se fossem lances de gênio."')
WHERE "seoSlug" = 'ex_pais_tecnico_de_todas';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Júlio, você chegou sem manual e sem obrigação. Podia ter sido só o namorado da minha mãe — escolheu ser presença, panqueca de sábado, mão levantada em reunião de escola. Sangue não te fez pai."')
WHERE "seoSlug" = 'ex_pais_pai_e_quem_fica';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Mãe, o papai está escrevendo porque eu só sei morder. Ele disse pra te contar o que ele vê: que vocç virou mãe no segundo em que me viu e nunca mais desligou."')
WHERE "seoSlug" = 'ex_maes_primeiro_dia';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Mãe, 919 km é o número que o Maps mostra. Mentira dele. Você tá aqui todo dia: no tempero que eu tento imitar, no áudio que eu guardo, na rosa 🌹 das 7h da manhã."')
WHERE "seoSlug" = 'ex_maes_dose_dupla_de_longe';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Mãe, a gente cresceu te vendo fazer conta no caderninho e mágica no fogão. Você transformou pouco em suficiente e suficiente em festa. Nunca soubemos como você estava em todas — sendo uma só."')
WHERE "seoSlug" = 'ex_maes_rainha_da_casa';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Vó, cientistas deviam estudar sua casa: o tempo passa diferente aí. A tarde dura mais, o problema encolhe, o bolo nunca acaba. Você me ensinou que amor se mede em fatia — sempre a maior pra mim."')
WHERE "seoSlug" = 'ex_avos_cheiro_de_bolo';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Vô, a gente sabe suas histórias de cor: o peixe-botijão, o gol narrado no rádio, a viagem de caminhão. Sabe por que pede de novo? Não é pela história. É pra ver o senhor contando."')
WHERE "seoSlug" = 'ex_avos_historias_do_vo';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Bisa, a senhora começou num chão batido e construiu chão pra todos nós pisarmos. São 6 filhos, 14 netos, 11 bisnetos — 31 pessoas que existem porque a senhora sorriu mesmo assim."')
WHERE "seoSlug" = 'ex_avos_quatro_geracoes';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Pai, mãe: a gente achou que conhecia vocês. Aí a Cecília nasceu e apareceram duas pessoas novas — o homem que fala fininho e a mulher que compra vestido tamanho 1 toda semana."')
WHERE "seoSlug" = 'ex_avos_primeira_viagem';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Carol, dizem que amizade de escola não sobrevive à vida adulta. A gente sobreviveu a provas, boys errados, mudanças de cidade e àquele corte de cabelo de 2014 que eu apoiei mesmo assim."')
WHERE "seoSlug" = 'ex_amizade_desde_a_escola';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Gente, a Casa 42 tinha infiltração, um sofá suspeito e a melhor população por metro quadrado do Brasil. A gente dividiu miojo, boleto, surto de TCC — e multiplicou tudo que importa."')
WHERE "seoSlug" = 'ex_amizade_republica';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Lu, a gente mede distância errado. Não são 7.700 km — são 2 horas de fuso, 1 áudio por dia e 1 tô indo aí por ano que sustenta tudo."')
WHERE "seoSlug" = 'ex_amizade_um_oceano';

UPDATE "Example"
SET "payload" = jsonb_set("payload", '{letter}', '"Léo, homem não fala dessas coisas, então vou escrever de uma vez: você é o irmão que a vida me deu por acidente (literalmente, minha janela que o diga). E a gente nunca mais toca no assunto."')
WHERE "seoSlug" = 'ex_amizade_irmaos_da_vida';
