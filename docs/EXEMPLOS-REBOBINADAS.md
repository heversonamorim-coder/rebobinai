# EXEMPLOS DE REBOBINADAS ◄◄ — 24 exemplos para a galeria

Conteúdo-fonte da task **F2-5 (seed-examples)**: 6 temas × 4 rebobinadas. Cada exemplo traz o **prompt para o Claude Code** (spec do `Example.payload_json`) e os **prompts para o Nano Banana** (fotos que alimentam timeline/galeria).

## Steps disponíveis (blocos da rebobinada)

1. **capa** — título com gancho + nomes + data
2. **contador** — timecode vivo de dias (estilo OSD: `SP 0:00:31`)
3. **timeline** — 4–7 momentos com micro-histórias específicas
4. **numeros** — 3 estatísticas da relação
5. **galeria** — fotos com legendas curtas
6. **carta** — 90–150 palavras que apertam o coração sem melar
7. **musica** — trilha da página
8. **encerramento** — frase final + ◄◄ replay

Cada exemplo usa um **mix diferente** de steps, de propósito: a galeria também demonstra a flexibilidade do produto.

## Preâmbulo — cole antes de cada exemplo no Claude Code

```
Você vai criar UMA rebobinada de exemplo para a galeria pública do Rebobinaí
(task F2-5, skill rebobinai-gallery:seed-examples).

Regras:
- Registro Example(persona, payload_json, seoSlug) no módulo gallery; seed
  idempotente por seoSlug (upsert). O payload_json usa o MESMO schema do
  Gift.payload_json (tipo compartilhado em packages/).
- Use exatamente os steps, títulos, momentos, números, carta e legendas da
  spec abaixo. Pode polir frases, mas não trocar as histórias — a
  especificidade é o produto.
- Tom da marca: quente, brincalhão, com um bip de tech. Estética VHS/Y2K
  (#FF2E9A / #18E9FF / #0A0713, timecodes em Space Mono, mark ◄◄).
- Imagens: usar os assets gerados (Nano Banana) já enviados ao R2 com chave
  de seed; associar cada foto à legenda indicada.
- Conteúdo passa pela moderação antes do seed.

Spec do exemplo:
```

## Estilo global de fotos — anexe ao fim de cada prompt do Nano Banana

```
Candid amateur smartphone photo, warm natural light, Brazilian setting and
Brazilian-looking people, subtle film grain, slightly imperfect framing like
a real family album, 3:4 portrait, no text or watermarks. Keep the SAME
characters consistent across all photos of this set.
```

---

# 1. Aniversário de Namoro

## 1.1 "Nossos 1.095 dias de nós" — 3 anos, distância vencida

Emoção-alvo: quem já contou dias para ver alguém. Steps: capa, contador, timeline, numeros, carta, musica, encerramento.

```
seoSlug: namoro-1095-dias · persona: namorada · ocasião: aniversário de namoro (3 anos)

CAPA: "Nossos 1.095 dias de nós" — Lia & Bruno · desde 14/07/2023
CONTADOR: início em 14/07/2023 ("dias sendo nós dois")

TIMELINE (6):
1. 14/07/2023 — O primeiro oi no aniversário da Carol. Você riu da minha piada ruim. Eu soube.
2. 09/2023 — 412 km de distância. A gente dormia em chamada de vídeo e acordava com o celular quente.
3. 12/2023 — Você apareceu de surpresa na rodoviária com um cartaz escrito "vim buscar meu wi-fi de abraço".
4. 06/2024 — A mudança. Duas malas, uma caixa de livros e zero arrependimento.
5. 03/2025 — Nossa primeira cozinha. Você errou o ponto do brigadeiro e a gente comeu de colher mesmo.
6. 07/2026 — Hoje. Mesmo sofá, mesma piada ruim, mesmo eu sabendo.

NÚMEROS: 1.095 dias · 14.600 minutos de chamada de vídeo · 8 rodoviárias

CARTA (dela para ele): "Bruno, a gente começou contando quilômetros e hoje conta só os dias — e olha que número bonito deu. Obrigada por cada ônibus lotado, por cada 'chegando' que demorava três horas, por ter feito da distância uma fase e não uma desculpa. Você é minha pessoa favorita de acordar do lado, mesmo quando rouba o edredom inteiro. Que venham os próximos mil dias, de preferência todos com brigadeiro no ponto errado. Te amo. — Lia"

MÚSICA: acústica romântica BR (ex.: "Vagalumes" versão lenta ou Tiago Iorc)
ENCERRAMENTO: "◄◄ rebobina que eu quero viver de novo"
```

Nano Banana (4 fotos — casal jovem ~25 anos, ela cabelo cacheado castanho, ele barba curta):

```
1. Young Brazilian couple saying goodbye at a bus station at night, tight hug,
   intercity bus in background, fluorescent station light.
2. Same couple cooking in a tiny apartment kitchen, laughing, chocolate
   brigadeiro pot on the stove, spoons in hand.
3. Same couple carrying moving boxes up an apartment staircase, sweaty and
   happy, one box labeled "LIVROS".
4. Same couple on a worn sofa under a blanket, watching TV, her legs over
   his lap, cozy evening lamp light.
```

## 1.2 "Do match ao pra sempre" — casal do aplicativo

Emoção-alvo: casais que se conheceram por app e ouvem piada por isso. Steps: capa, timeline, numeros, galeria, carta, musica.

```
seoSlug: namoro-do-match · persona: namorado · ocasião: aniversário de namoro (2 anos)

CAPA: "Do match ao pra sempre" — Rê & Dudu · o arraste pro lado mais certeiro do Brasil
TIMELINE (5):
1. O match. Sua bio dizia "não curto papo furado". Eu mandei um papo furadíssimo. Funcionou.
2. Primeiro encontro: você pediu o hambúrguer mais caro "pra testar se eu ia embora". Fiquei.
3. O dia em que apagamos os aplicativos juntos, um segurando o celular do outro.
4. Primeira viagem: pneu furado na serra, 2h de espera e a melhor conversa da minha vida no acostamento.
5. Hoje: 2 anos de "cê viu isso?" mandado ao mesmo tempo.

NÚMEROS: 1 arraste pro lado · 730 dias de conversa que não acabou · 3.412 memes trocados

GALERIA (4 legendas):
1. "O hambúrguer do teste. Passei."
2. "Cerimônia oficial de desinstalação."
3. "O acostamento mais romântico da serra."
4. "A gente, versão atual. Melhor update."

CARTA (dele): "Rê, todo mundo ri quando conta que a gente veio de um aplicativo. Eu também rio — de sorte. Porque no meio de mil perfis eu achei a única pessoa que responde meme com meme melhor, que transforma pneu furado em história boa e silêncio em lugar confortável. Você foi o único match que virou casa. Dois anos, e eu ainda arrastaria pro lado de novo, sempre. — Dudu"

MÚSICA: pop romântico leve (ex.: Jão ou Vitor Kley)
```

Nano Banana (4 fotos — ela loira mel, óculos; ele moreno alto):

```
1. Brazilian couple at a burger restaurant on a first date, she smiles holding
   a huge burger, string lights, slightly nervous energy.
2. Same couple holding each other's phones face-to-face, playful ceremony vibe,
   deleting apps, café table with two coffees.
3. Same couple sitting on a highway guardrail next to a car with a flat tire,
   green mountain road, golden hour, both laughing.
4. Same couple selfie at home, faces squeezed together, TV glow behind,
   genuine laughter.
```

## 1.3 "365 dias do nosso primeiro beijo" — primeiro aniversário

Emoção-alvo: namoro novo, tudo ainda é primeira vez. Steps: capa, contador, galeria, carta, musica, encerramento.

```
seoSlug: namoro-primeiro-ano · persona: namorada · ocasião: 1 ano de namoro

CAPA: "365 dias do nosso primeiro beijo" — Marina & Ícaro
CONTADOR: início na data do primeiro beijo ("dias desde que eu perdi a linha do 'só amigos'")

GALERIA (5 legendas):
1. "A festa onde tudo desandou (pro lado certo)."
2. "Primeiro café da manhã: você queimou o pão e eu menti que estava ótimo."
3. "O dia da praia em que choveu. Melhor dia de praia da história."
4. "Você conhecendo minha mãe. Ela te aprovou antes de mim."
5. "A gente ontem. Ainda com cara de primeiro beijo."

CARTA: "Ícaro, faz um ano que a gente estragou uma amizade perfeitamente boa — e foi a melhor decisão que já tomamos. Um ano de primeiras vezes: primeiro café queimado, primeira chuva na praia, primeira vez que eu percebi que 'te amo' escapa sozinho quando é verdade. Obrigada por tornar o comum a melhor parte do meu dia. Que a gente nunca perca a cara de primeiro beijo. — Marina"

MÚSICA: indie BR suave (ex.: ANAVITÓRIA)
ENCERRAMENTO: "◄◄ aperta o play na nossa história"
```

Nano Banana (5 fotos — casal ~22 anos, ela franja, ele cabelo encaracolado):

```
1. Young Brazilian couple almost kissing at a house party, fairy lights,
   friends blurred in background, caught-moment feel.
2. Same couple at a breakfast table with visibly burnt toast, he shrugs
   apologetically, she laughs, morning window light.
3. Same couple running on a beach in the rain sharing one towel overhead,
   grey sky, pure joy.
4. Same couple at a family lunch, an older woman (her mother) hugging him
   warmly, crowded happy table.
5. Same couple close-up selfie, foreheads touching, golden hour.
```

## 1.4 "A gente + a Nina" — o casal que virou família de pet

Emoção-alvo: casais cujo marco é o bicho adotado juntos. Steps: capa, contador, timeline, numeros, carta, musica.

```
seoSlug: namoro-a-gente-e-a-nina · persona: namorado · ocasião: aniversário de namoro (4 anos)

CAPA: "A gente + a Nina" — Paula & Vitor (e a vira-lata caramelo que manda em tudo)
CONTADOR: início do namoro ("dias de matilha")

TIMELINE (5):
1. Ano 1 — Só a gente, dois delivery e uma série que nunca terminamos.
2. Ano 2 — O anúncio de adoção que você me mandou "só pra ver". Aham. Só pra ver.
3. O dia da Nina: ela vomitou no carro em 15 minutos de estrada. Já era da família.
4. Ano 3 — Ela destruiu seu tênis favorito. Você a perdoou em 4 segundos, recorde mundial.
5. Hoje — Cama de casal com três habitantes, dois pagando aluguel.

NÚMEROS: 1.460 dias juntos · 730 passeios de coleira · 1 tênis (in memoriam)

CARTA (dele): "Paula, quatro anos e eu ainda não sei o que amo mais: acordar com você ou com a Nina pisando na minha cara às 6h. Mentira, sei sim. Obrigado por ter mandado aquele anúncio 'só pra ver' e por transformar nosso apartamento em lar com pelo no sofá. Você cuida de nós dois de um jeito que me faz querer ser tão bom quanto a Nina acha que eu sou. — Vitor"

MÚSICA: MPB leve e alegre (ex.: "Trem-Bala" instrumental ou Rubel)
```

Nano Banana (4 fotos — casal ~28 anos + vira-lata caramelo):

```
1. Brazilian couple at an animal shelter meeting a caramel-colored mutt puppy
   for the first time, kneeling, puppy licking her face.
2. Same caramel dog, slightly older, sitting guiltily next to a destroyed
   sneaker, the couple in background trying not to laugh.
3. Same couple walking the caramel dog at sunset on a tree-lined street,
   holding hands, leash in his other hand.
4. Same couple asleep in bed on a Sunday morning with the caramel dog
   sprawled between them taking all the space.
```

---

# 2. Aniversário de Casamento

## 2.1 "25 anos e a louça de domingo" — bodas de prata (feito pelos filhos)

Emoção-alvo: filhos homenageando o casamento dos pais. Steps: capa, contador, timeline, numeros, carta, musica, encerramento.

```
seoSlug: casamento-bodas-prata · persona: casamento · ocasião: bodas de prata (25 anos)

CAPA: "25 anos e a louça de domingo" — Sônia & Carlos · dos filhos, com amor e provas
CONTADOR: data do casamento ("dias de 'pergunta pra sua mãe'")

TIMELINE (6):
1. 2001 — O casamento no salão da igreja. O bolo era emprestado da vitrine, o amor não.
2. 2003 — Chegou a Ju. Papai chorou escondido no corredor da maternidade (a gente sabe, pai).
3. 2007 — Chegou o Rafa. A Ju pediu pra devolver. Superamos.
4. 2012 — A casa própria. Mudança em dia de chuva e feijoada no chão da sala vazia.
5. 2019 — A primeira viagem de vocês dois sozinhos em 16 anos. Vocês ligaram 6 vezes.
6. 2026 — 25 anos. E papai ainda olha pra mamãe como no vídeo do casamento.

NÚMEROS: 9.125 dias casados · 1.300 almoços de domingo · 2 filhos que deram certo (de nada)

CARTA (dos filhos): "Pai, mãe: a gente cresceu achando que todo casal era assim — café passado um pro outro, briga por causa do controle remoto, dancinha na cozinha quando acham que ninguém vê. Demorou pra entender que isso é raro. Vinte e cinco anos depois, vocês continuam sendo nossa prova de que amor de verdade é feito de coisas pequenas repetidas com vontade. Obrigado por serem nosso lugar seguro. Assinado: os dois melhores frutos dessa união (modéstia à parte). — Ju & Rafa"

MÚSICA: a música da valsa do casamento deles (clássico romântico anos 90/2000, ex.: Roupa Nova)
ENCERRAMENTO: "◄◄ 25 anos merecem replay"
```

Nano Banana (5 fotos — casal ~50 anos; nas fotos antigas, ~25 anos):

```
1. 2000s-style wedding photo of a young Brazilian couple in a simple church
   hall, grainy analog film look, modest cake, flash photography aesthetic.
2. Same couple aged around 35 with two small kids on a sofa, 2010s
   compact-camera look, slightly overexposed.
3. Same couple, aged 50, dancing in the kitchen, she in an apron, both
   laughing, Sunday lunch pots on the stove.
4. Same older couple on a beach boardwalk, selfie taken at wrong angle
   (classic parents selfie), genuine smiles.
5. Same older couple sitting at a family lunch table with two adult kids,
   toasting with glasses, warm afternoon light.
```

## 2.2 "Nosso primeiro ano de alianças" — 1º aniversário de casamento

Emoção-alvo: recém-casados revivendo o grande dia. Steps: capa, contador, galeria, numeros, carta, musica.

```
seoSlug: casamento-primeiro-ano · persona: casamento · ocasião: 1 ano de casados

CAPA: "Nosso primeiro ano de alianças" — Bea & Tom
CONTADOR: data do casamento ("dias de 'meu marido' e 'minha esposa' sem cansar")

GALERIA (5 legendas):
1. "O sim. Sua voz falhou e a minha sumiu."
2. "A dança que ensaiamos 14 vezes e erramos mesmo assim."
3. "Lua de mel: perdemos o voo e ganhamos uma noite em Lisboa."
4. "Primeira geladeira nossa. Enchemos de ímã e de planos."
5. "365 dias depois: mesma vontade de casar de novo."

NÚMEROS: 365 dias de casados · 1 voo perdido que virou história · 52 sextas de pizza no sofá

CARTA (dela): "Tom, um ano atrás sua voz falhou no altar e eu entendi tudo o que você não conseguiu falar. Este primeiro ano teve mais boleto que lua de mel, mais rotina que festa — e ainda assim, casar com você continua sendo a coisa mais certa que eu já fiz. Obrigada por transformar segunda-feira em lugar bom. Que a gente erre a dança juntos pra sempre. — Bea"

MÚSICA: a música da primeira dança (ex.: "All of Me" ou versão acústica BR)
```

Nano Banana (5 fotos — casal ~30 anos, casamento ao ar livre):

```
1. Brazilian couple at an outdoor garden wedding altar exchanging vows, he
   tearing up, string lights and green foliage.
2. Same couple doing a slightly clumsy first dance, guests laughing warmly
   with them, fairy lights bokeh.
3. Same couple exhausted but laughing at an airport gate at night, luggage
   around, boarding passes in hand.
4. Same couple decorating a fridge with travel magnets in a new apartment
   kitchen, moving boxes visible.
5. Same couple recreating their altar pose at home, casual clothes, one year
   later, holding a "365" handwritten sign.
```

## 2.3 "De 2 viramos 4" — 10 anos, com filhos

Emoção-alvo: casamento que virou família cheia. Steps: capa, contador, timeline, numeros, carta, musica.

```
seoSlug: casamento-de-2-viramos-4 · persona: casamento · ocasião: 10 anos de casados

CAPA: "De 2 viramos 4 (e um papagaio)" — Dani & Fê
CONTADOR: data do casamento ("dias de time em campo")

TIMELINE (6):
1. 2016 — Casamos com festa pequena e planos gigantes.
2. 2018 — O positivo no banheiro. Você gritou tão alto que a vizinha bateu na parede.
3. 2019 — Chegou o Théo. Dormir virou lenda urbana.
4. 2022 — Chegou a Alice, com pressa: quase nasceu no Uber. O motorista ganhou 5 estrelas e terapia.
5. 2024 — O papagaio Juca, herdado do seu tio. Fala "cadê o boleto" melhor que nós dois.
6. 2026 — 10 anos: a casa é barulhenta, bagunçada e exatamente o que a gente pediu.

NÚMEROS: 3.650 dias casados · 2 humanos produzidos · ~14.000 fraldas (estimativa conservadora)

CARTA (dele): "Dani, dez anos atrás eu prometi te amar na alegria e na tristeza. Ninguém avisou da terceira opção: na exaustão. E olha que descoberta — é nela que eu mais te amo. Te vendo domar birra às 3h da manhã, rir no meio do caos, segurar a nossa casa com uma mão e a minha mão com a outra. A gente virou 4 (e um papagaio), mas no fim do dia, quando todo mundo dorme, ainda somos aqueles 2. Sempre seremos. — Fê"

MÚSICA: MPB família (ex.: "Velha Infância" — Tribalistas)
```

Nano Banana (5 fotos — casal ~38 anos, menino 7, menina 4):

```
1. Brazilian couple wedding photo in a small backyard party, 2016 style,
   simple decoration, both mid-laugh.
2. Same woman holding a positive pregnancy test, husband screaming with joy
   in a small bathroom doorway, candid.
3. Same couple exhausted on a sofa, each holding a sleeping baby/toddler,
   toys everywhere, 3am lamp light, tired smiles.
4. Family of four at a chaotic breakfast table, a parrot perched on the
   chair, kids mid-mess, parents mid-laugh.
5. Same couple slow dancing in the living room at night, kids asleep on the
   sofa behind them, TV static glow.
```

## 2.4 "50 anos de nós" — bodas de ouro (feito pelos netos)

Emoção-alvo: gerações celebrando o amor que originou a família. Steps: capa, contador, timeline, carta, musica, encerramento.

```
seoSlug: casamento-bodas-ouro · persona: casamento · ocasião: bodas de ouro (50 anos)

CAPA: "50 anos de nós" — Vó Cida & Vô Antônio · dos netos que existem graças a esse encontro
CONTADOR: data do casamento em 1976 ("dias de mão dada")

TIMELINE (6):
1. 1974 — O baile. Vô pediu uma dança e pisou no pé dela duas vezes. Ela aceitou a terceira.
2. 1976 — Casamento na cidade pequena. A festa acabou quando acabou a sanfona.
3. 1980s — Quatro filhos, uma venda na frente da casa e a fama do melhor pão da rua.
4. 1990s — A mudança pra capital atrás dos filhos. Recomeçar aos 45 também é coragem.
5. 2010 — Primeira neta. Vô inaugurou o posto de avô-babão que ocupa até hoje.
6. 2026 — 50 anos. Vô ainda guarda a rosa (seca) do baile. A gente viu.

CARTA (dos netos): "Vó, vô: metade da família nem tinha nascido quando vocês já eram história. A gente cresceu ouvindo do baile, da sanfona, do pão que sustentou quatro filhos. Mas o que a gente mais aprendeu foi olhando: o senhor descascando laranja pra ela todo santo dia, ela guardando o pedaço maior pro senhor. Cinquenta anos e vocês ainda se escolhem no café da manhã. Se amor tiver receita, a gente quer a de vocês. — Seus netos (todos, até o que só pensa em videogame)"

MÚSICA: a moda de viola/sanfona do baile (ex.: dueto sertanejo raiz)
ENCERRAMENTO: "◄◄ algumas fitas nunca desgastam"
```

Nano Banana (5 fotos — casal ~75 anos; foto 1 estilo anos 70):

```
1. 1970s black-and-white photo of a young Brazilian couple dancing at a small
   town ball, accordion player in background, vintage film grain.
2. Elderly Brazilian couple, mid-70s, sitting on a porch, he peels an orange
   and hands her a slice, morning light.
3. Same elderly couple surrounded by a large multi-generation family at a
   long lunch table, golden hour backyard.
4. Close-up of two aged hands with worn gold wedding bands, holding, over a
   crocheted tablecloth.
5. Same elderly couple laughing while looking at an old photo album, a dried
   rose kept between the pages.
```

---

# 3. Dia dos Pais

## 3.1 "O homem do churrasco" — filha adulta para o pai

Emoção-alvo: pai provedor de afeto disfarçado de praticidade. Steps: capa, timeline, numeros, carta, musica, encerramento.

```
seoSlug: pais-homem-do-churrasco · persona: pai · ocasião: Dia dos Pais

CAPA: "O homem do churrasco (e do resto todo)" — Pro meu pai, Seu Marcos
TIMELINE (5):
1. 1999 — Você me ensinou a andar de bicicleta soltando o banco sem avisar. Funcionou. Nunca te perdoei. Obrigada.
2. 2005 — Toda festa da escola: você lá, na primeira fileira, filmando na horizontal errada.
3. 2013 — Minha primeira decepção amorosa. Você não disse nada. Só fez churrasco. Era exatamente o que eu precisava.
4. 2020 — Você aprendeu a fazer videochamada só pra me ver na pandemia. Passou 3 meses me mostrando o teto.
5. 2026 — Hoje eu levo o carro pra você "dar uma olhada" só pra ter desculpa de te ver.

NÚMEROS: ~700 churrascos de domingo · 100% das caronas atendidas · 0 vezes que você disse "eu avisei" (mesmo tendo avisado)

CARTA: "Pai, você nunca foi de falar 'eu te amo'. Você fala 'calibrou o pneu?', 'avisa quando chegar', 'tem picanha aqui de domingo'. Demorei pra entender que era tudo a mesma frase. Obrigada por me soltar da bicicleta na hora certa e por nunca me soltar de verdade. Todo domingo, quando sinto cheiro de churrasco, é de você que eu lembro. Feliz Dia dos Pais, Seu Marcos. Calibrei o pneu, sim. — Sua filha"

MÚSICA: sertanejo/MPB de pai (ex.: "Pai" — Fábio Jr. ou instrumental)
ENCERRAMENTO: "◄◄ rebobina: você sempre esteve lá"
```

Nano Banana (4 fotos — pai ~55 anos grisalho, filha ~28):

```
1. Brazilian dad in his 50s teaching a little girl to ride a bike on a
   residential street, 90s film photo look, him running behind.
2. Same dad at a backyard barbecue grill, tongs in hand, apron, adult
   daughter stealing a piece of meat, both laughing.
3. Same dad awkwardly holding a phone too close to his face on a video call,
   half his forehead in frame, endearing.
4. Adult daughter and dad leaning on an open car hood, he points at the
   engine explaining, she watches him instead, warm smile.
```

## 3.2 "Seu primeiro Dia dos Pais" — da esposa para o marido

Emoção-alvo: paternidade recém-nascida. Steps: capa, contador, galeria, carta, musica.

```
seoSlug: pais-primeiro-dia · persona: pai · ocasião: primeiro Dia dos Pais

CAPA: "Seu primeiro Dia dos Pais" — Pro Gabriel, do Miguel (com ajuda da mamãe)
CONTADOR: nascimento do Miguel ("dias sendo o pai do Miguel")

GALERIA (5 legendas):
1. "O dia em que você virou pai e eu me apaixonei de novo."
2. "Primeira troca de fralda: 22 minutos, 3 tentativas, 1 vitória."
3. "Vocês dois dormindo igual. Geneticamente comprovado."
4. "O banho que molhou mais você do que ele."
5. "Primeiro 'papapa'. Você jura que foi 'papai'. Deixa."

CARTA (dela, assinada pelo bebê): "Pai, eu ainda não sei falar, então a mamãe está escrevendo. Ela mandou dizer que te ver comigo no colo é a coisa mais bonita que ela já viu — e ela viu o mar. Que você acorda de madrugada sem reclamar (quase), que canta desafinado igual eu gosto, e que eu ganhei na loteria dos pais. Feliz primeiro Dia dos Pais. Dos infinitos que vêm por aí, esse é o que você nunca vai esquecer. — Miguel (7 meses, 8 quilos de amor por você)"

MÚSICA: ninar indie (ex.: "Paciência" — Lenine, acústica)
```

Nano Banana (5 fotos — pai ~32 anos, bebê ~7 meses):

```
1. Brazilian man crying with joy holding a newborn in a maternity ward,
   hospital bracelet visible, raw emotional moment.
2. Same man mid-diaper-change looking overwhelmed but determined, baby
   supplies scattered, morning light.
3. Same man and baby asleep on a sofa in identical positions, mouths open,
   shot from above.
4. Same man giving the baby a bath in a small tub, his shirt soaked, baby
   splashing, both delighted.
5. Same man lifting the baby overhead in a sunlit living room, baby
   laughing, dust particles in golden light.
```

## 3.3 "Meu técnico de todas as horas" — filho para o pai (futebol)

Emoção-alvo: pai e filho que se comunicam por futebol. Steps: capa, timeline, numeros, galeria, carta, musica.

```
seoSlug: pais-tecnico-de-todas · persona: pai · ocasião: Dia dos Pais

CAPA: "Meu técnico de todas as horas" — Pro pai, do seu eterno camisa 10 (na várzea do quintal)
TIMELINE (5):
1. 2003 — Minha primeira bola. Você narrou meu primeiro gol contra o portão como se fosse final de Copa.
2. 2008 — Você saía do turno cansado e ainda ia comigo pro treino. Nunca faltou. Eu contei.
3. 2014 — A gente viu o 7x1 junto. Você disse "filho, tem derrota que vira história". Uso isso pra tudo até hoje.
4. 2018 — Meu joelho, a cirurgia, o fim do sonho de jogar. Você no hospital: "muda o sonho, não muda o time que a gente é".
5. 2026 — Hoje é você e eu no sofá, mesmo time, mesma resenha, e eu não trocaria por camarote nenhum.

NÚMEROS: ~480 treinos com plateia de 1 · 23 anos de arquibancada · 1 lema pra vida inteira

CARTA: "Pai, você nunca me cobrou gol. Me cobrou caráter. Aprendi a perder no futebol e a ganhar na vida ouvindo você narrar meus erros como se fossem lances de gênio. Quando meu joelho estourou junto com meu sonho, você não deixou estourar o resto. 'Muda o sonho, não muda o time.' Nosso time, velho, não rebaixa nunca. Feliz Dia dos Pais. — Seu camisa 10"

MÚSICA: hino do time do coração (versão instrumental) ou "Coração de Estudante"
```

Nano Banana (4 fotos — pai ~58, filho dos 8 aos 30):

```
1. Brazilian father celebrating wildly as a small boy scores a goal against
   a backyard gate, arms raised, 2000s film look.
2. Same father in work uniform watching a boys' football practice from
   behind a wire fence at dusk, tired but present.
3. Father sitting at a hospital bedside of a young man with a leg brace,
   hand on his shoulder, quiet strength.
4. Adult son and older father on a sofa in matching football jerseys,
   mid-celebration of a goal on TV, popcorn flying.
```

## 3.4 "Pai é quem fica" — para o padrasto/pai de criação

Emoção-alvo: paternidade escolhida. Steps: capa, contador, timeline, carta, musica, encerramento.

```
seoSlug: pais-pai-e-quem-fica · persona: pai · ocasião: Dia dos Pais

CAPA: "Pai é quem fica" — Pro Júlio, que não precisava e escolheu
CONTADOR: dia em que ele entrou na nossa vida ("dias desde que você escolheu a gente")

TIMELINE (5):
1. 2010 — Você apareceu no aniversário de 8 anos com o presente certo: paciência.
2. 2011 — Eu te testei por meses. Você respondeu com panqueca aos sábados. Vitória sua.
3. 2015 — Reunião de escola: "responsável pelo aluno". Você levantou a mão sem hesitar um segundo.
4. 2019 — Você me ensinou a dirigir sem gritar nenhuma vez. Um monge. Um santo. Um pai.
5. 2024 — Na formatura, chamaram "os pais do formando". Você olhou pros lados. Era você, Júlio. Sempre foi.

CARTA: "Júlio, você chegou sem manual e sem obrigação. Podia ter sido só 'o namorado da minha mãe' — escolheu ser presença, panqueca de sábado, mão levantada em reunião de escola. Sangue não te fez meu pai. Você se fez, dia após dia, ficando. Na minha formatura, quando disseram 'os pais', eu nem olhei pros lados: já sabia. Feliz Dia dos Pais pra quem me ensinou que família é verbo. — Teu moleque"

MÚSICA: MPB emotiva (ex.: "Trem Bala" ou "Anunciação")
ENCERRAMENTO: "◄◄ família é quem aperta o play com você"
```

Nano Banana (4 fotos — padrasto ~48, enteado dos 8 aos 22):

```
1. Brazilian man kneeling to give a wrapped gift to a shy 8-year-old boy at
   a small birthday party, warm cautious first-meeting energy.
2. Same man making pancakes on a Saturday morning, teenage boy at the
   counter, comfortable domestic scene.
3. Same man in a driving lesson passenger seat, calm and encouraging, young
   man at the wheel, both relaxed.
4. Graduation ceremony: young man in cap and gown hugging the man tightly,
   emotional, proud tears.
```

---

# 4. Dia das Mães

## 4.1 "A mulher do 'já comeu?'" — filha adulta para a mãe

Emoção-alvo: o amor materno em forma de comida e ligação diária. Steps: capa, timeline, numeros, carta, musica, encerramento.

```
seoSlug: maes-ja-comeu · persona: mãe · ocasião: Dia das Mães

CAPA: "A mulher do 'já comeu?'" — Pra Dona Regina, minha primeira casa
TIMELINE (5):
1. Desde sempre — Todo dia, 12h30, o telefone toca. "Filha, já comeu?" O relógio da minha vida é você.
2. 2002 — A febre de madrugada. Você atravessou a cidade de ônibus com sopa num pote de sorvete.
3. 2010 — Você vendeu a máquina de costura pra pagar meu cursinho. Eu descobri anos depois. Nunca esqueci.
4. 2017 — Minha mudança pra outra cidade. Você chorou depois que o carro virou a esquina (o vizinho contou).
5. 2026 — Hoje eu ligo 12h30 em ponto. "Mãe, já comeu?"

NÚMEROS: ~8.700 ligações de 'já comeu' · 1 máquina de costura que virou diploma · infinitos potes de sorvete com sopa

CARTA: "Mãe, demorei a vida inteira pra entender que 'já comeu?' significa 'eu te amo mais do que sei dizer'. Que sopa em pote de sorvete é declaração. Que máquina de costura vendida em silêncio é o maior discurso que já ouvi. Você me ensinou amor do jeito mais difícil de retribuir: sem cobrar nada. Hoje sou eu que ligo. Já comeu, mãe? Porque o meu coração, você alimentou pra sempre. — Sua filha"

MÚSICA: "Como Nossos Pais" (Elis) ou MPB de colo
ENCERRAMENTO: "◄◄ toda história começa com ela"
```

Nano Banana (4 fotos — mãe ~60, filha ~32):

```
1. Brazilian woman in her 50s talking on an old kitchen phone, wall clock
   showing 12:30, pots on the stove, warm kitchen light.
2. Same woman on a night bus holding an ice cream container wrapped in a
   plastic bag on her lap, determined tenderness.
3. Vintage sewing machine by a window with a graduation photo frame next to
   it, symbolic still life, dust in light.
4. Adult daughter and mother cooking together in the same kitchen, daughter
   now stirring the pot, mother laughing, role reversal.
```

## 4.2 "Seu primeiro Dia das Mães" — do marido para a esposa

Emoção-alvo: a estreia na maternidade. Steps: capa, contador, galeria, numeros, carta, musica.

```
seoSlug: maes-primeiro-dia · persona: mãe · ocasião: primeiro Dia das Mães

CAPA: "Seu primeiro Dia das Mães" — Pra Amanda, da Helena (ditado pro papai)
CONTADOR: nascimento da Helena ("dias sendo a mãe da Helena")

GALERIA (5 legendas):
1. "O primeiro colo. Você tremia e acertava ao mesmo tempo."
2. "Madrugada 47: vocês duas dormindo na poltrona. Eu tirei a foto chorando."
3. "Primeiro banho de sol. Você conferiu o protetor 6 vezes."
4. "O dia em que ela riu pela primeira vez. Foi pra você. Óbvio."
5. "Mãe e filha: 8 meses de olhares que eu nunca vou saber traduzir."

NÚMEROS: 240 dias de mãe · ~1.400 madrugadas interrompidas sem perder a ternura · 1 riso que valeu tudo

CARTA (dele, pela filha): "Mãe, o papai está escrevendo porque eu só sei morder. Ele disse pra te contar o que ele vê: que você virou mãe no segundo em que me viu e nunca mais desligou. Que canta pra mim mesmo morrendo de sono, que aprendeu meus choros como quem aprende um idioma. Ele disse que sempre te amou, mas que te ver ser minha mãe é outra coisa — é assistir um super-herói de pijama. Feliz primeiro Dia das Mães. — Helena (e o papai, chorando no canto)"

MÚSICA: canção de ninar acústica (ex.: "Oração ao Tempo" suave)
```

Nano Banana (5 fotos — mãe ~30, bebê menina ~8 meses):

```
1. Brazilian woman holding a newborn for the very first time in a hospital
   bed, trembling careful hands, overwhelming love in her face.
2. Mother and baby asleep together in an armchair at 3am, nightlight glow,
   baby bottle on side table.
3. Same mother applying sunscreen to a baby by a sunny window, morning sun
   patch on the floor, gentle scene.
4. Baby laughing for the first time at her mother making a silly face,
   mid-laugh burst, kitchen background.
5. Close-up of mother and baby daughter forehead to forehead, eyes locked,
   soft window light.
```

## 4.3 "Mãe em dose dupla" — para a mãe que morou longe e nunca saiu de perto

Emoção-alvo: filho que mora fora, saudade e áudio de WhatsApp. Steps: capa, contador, timeline, carta, musica.

```
seoSlug: maes-dose-dupla-de-longe · persona: mãe · ocasião: Dia das Mães (à distância)

CAPA: "919 km e nenhuma distância" — Pra minha mãe, do filho que voou mas não saiu do ninho
CONTADOR: dias desde a mudança ("dias matando a saudade em áudio de 4 minutos")

TIMELINE (5):
1. 2021 — O abraço na rodoviária. Você disse "vai, filho" com a voz firme e a mão tremendo.
2. 2022 — Descobri que você aprendeu a usar o Maps só pra "ver minha rua" de vez em quando.
3. 2023 — Seus áudios de 4 minutos: 1 de recado, 3 de novela da vizinhança. Eu ouço tudo. Duas vezes.
4. 2024 — Você veio de surpresa com uma mala: 2kg de roupa, 8kg de comida congelada.
5. 2026 — Todo dia, sem falhar: "bom dia meu filho, Deus te abençoe 🌹". É meu despertador favorito.

CARTA: "Mãe, 919 km é o número que o Maps mostra. Mentira dele. Você tá aqui todo dia: no tempero que eu tento imitar, no áudio que eu guardo, na rosa 🌹 das 7h da manhã. Você me soltou pro mundo com a mão tremendo e nunca deixou eu me sentir solto. Um dia eu volto, ou te trago — mas até lá, saiba: filho que voa alto é porque a mãe construiu o ninho no lugar certo. Te amo. — Seu menino"

MÚSICA: "Fico Assim Sem Você" acústica ou moda de saudade
```

Nano Banana (4 fotos — mãe ~58, filho ~26):

```
1. Brazilian mother hugging her adult son tightly at a bus station, luggage
   at their feet, her eyes closed hard, emotional farewell.
2. Older woman at a kitchen table recording a long WhatsApp audio, phone
   close to her mouth, gesturing as she speaks, endearing.
3. Open suitcase full of frozen food containers wrapped in plastic bags,
   labeled with masking tape, one clothing item squeezed in the corner.
4. Young man in a small apartment cooking while watching a video call
   propped against the wall, his mother on screen instructing.
```

## 4.4 "As rainhas da casa" — filhos adultos juntos para a mãe viúva

Emoção-alvo: mãe que segurou tudo sozinha. Steps: capa, timeline, numeros, galeria, carta, musica, encerramento.

```
seoSlug: maes-rainha-da-casa · persona: mãe · ocasião: Dia das Mães

CAPA: "A rainha desta casa" — Pra Dona Marta, dos 3 que ela criou no braço
TIMELINE (5):
1. 2004 — Ficamos só nós quatro. Você disse "ninguém vai faltar nada". Cumpriu com juros.
2. 2004–2012 — Dois empregos, marmita na bolsa e presença em TODA reunião de escola. A gente nunca soube como.
3. 2013 — O primeiro diploma da família. Você chorou tanto que a foto saiu tremida. Emolduramos assim mesmo.
4. 2018 — A gente se juntou e te deu a viagem pra praia. Primeira vez que você viu o mar. Aos 52.
5. 2026 — Três filhos formados, uma casa cheia de neto e a mesma frase: "ninguém vai faltar nada". Nunca faltou, mãe. Você era o que não podia faltar.

NÚMEROS: 3 filhos criados no braço · 2 empregos por 8 anos · 0 reuniões de escola perdidas

GALERIA (3 legendas):
1. "A foto tremida do primeiro diploma. Nossa favorita."
2. "Aos 52, o primeiro mar. Seu sorriso ganhou da paisagem."
3. "A mesa cheia que você sempre sonhou. Você construiu."

CARTA (dos três): "Mãe, a gente cresceu te vendo fazer conta no caderninho e mágica no fogão. Você transformou pouco em suficiente e suficiente em festa. Nunca soubemos como você estava em todas — trabalho, escola, plantão de febre — sendo uma só. Hoje, cada conquista nossa tem sua digital. O diploma é seu. A casa é sua. O mar, a gente devia ter te mostrado antes. Obrigado por nunca deixar faltar o principal. Era você. — Seus 3"

MÚSICA: "Mama Africa" suave ou "Dona Cila" — Maria Gadú
ENCERRAMENTO: "◄◄ replay pra quem nunca pausou"
```

Nano Banana (4 fotos — mãe dos 40 aos 60, 3 filhos):

```
1. Brazilian woman in work uniform packing lunch boxes at dawn in a modest
   kitchen, three school backpacks lined up by the door, 2000s look.
2. Slightly blurry, shaky photo of a graduation: mother crying hugging a
   graduate, motion blur authentic, flash photo.
3. Woman in her 50s seeing the ocean for the first time, arms open, laughing
   and crying, adult children behind her filming.
4. Big family Sunday lunch, older woman at the head of a crowded table,
   grandchildren around, abundance and joy.
```

---

# 5. Dia dos Avós

## 5.1 "A casa da vó tem cheiro de bolo" — neta para avó

Emoção-alvo: infância na casa da avó. Steps: capa, timeline, numeros, carta, musica, encerramento.

```
seoSlug: avos-cheiro-de-bolo · persona: avó · ocasião: Dia dos Avós

CAPA: "A casa da vó tem cheiro de bolo" — Pra Vó Terezinha, da neta que roubava a raspa da panela
TIMELINE (5):
1. 1998 — Suas mãos me ensinando a mexer o bolo "devagar, senão desanda". Aplico isso na vida.
2. 2003 — Férias inteiras na sua casa: café com bolacha às 15h, novela às 18h, benzida antes de dormir.
3. 2008 — Você guardava dinheiro do troco num pote de margarina "pro lanche da minha neta".
4. 2015 — Te liguei chorando da faculdade. Você: "vem passar o fim de semana que eu resolvo". Resolveu. Com bolo.
5. 2026 — Hoje eu faço seu bolo na minha casa. Nunca fica igual. Já entendi por quê: falta você.

NÚMEROS: ~2.000 tardes de café às 15h · 1 pote de margarina que era cofre · 28 anos de colo garantido

CARTA: "Vó, cientistas deviam estudar sua casa: o tempo passa diferente aí. A tarde dura mais, o problema encolhe, o bolo nunca acaba. Você me benzeu, me alimentou e me ensinou que amor se mede em fatia — sempre generosa, sempre a maior pra mim. Tento fazer seu bolo e não sai igual. Tudo bem. Receita boa a gente não replica, visita. Feliz Dia dos Avós pra melhor parte da minha infância — e da minha vida adulta também. — Sua neta"

MÚSICA: "Andança" ou moda antiga de rádio de cozinha
ENCERRAMENTO: "◄◄ rebobina pra tarde na casa da vó"
```

Nano Banana (4 fotos — avó ~78, neta dos 6 aos 28):

```
1. Brazilian grandmother teaching a small girl to stir cake batter in an
   old tiled kitchen, flour on the girl's nose, 90s film look.
2. Grandmother and child having afternoon coffee with crackers at a small
   table with floral tablecloth, 3pm light through lace curtains.
3. A margarine pot full of coins and small bills, kept inside a cupboard,
   nostalgic still life.
4. Adult granddaughter hugging the elderly grandmother from behind in the
   same kitchen, cake on the counter, both laughing.
```

## 5.2 "As histórias do vô (todas as 7)" — netos para avô

Emoção-alvo: avô contador de causos repetidos. Steps: capa, timeline, numeros, galeria, carta, musica.

```
seoSlug: avos-historias-do-vo · persona: avô · ocasião: Dia dos Avós

CAPA: "As histórias do vô (todas as 7)" — Pro Vô Chico, dos netos que fingem que nunca ouviram
TIMELINE (5):
1. A do peixe que "era do tamanho de um botijão". Cresce 10cm por ano. Amamos.
2. A da pescaria em que você me deixou dormir no barco e disse pra vó que eu "ajudei muito".
3. A do rádio de pilha: Copa de 70 na sua voz é melhor que qualquer transmissão.
4. A da bicicleta que você consertou 14 vezes em vez de deixar comprarem uma nova. "Essa aqui tem história."
5. A que você não conta: quantas vezes ajudou todo mundo em silêncio. Essa a gente conta por você.

NÚMEROS: 7 histórias em rotação infinita · ~340 pescarias · 14 consertos na mesma bicicleta

GALERIA (3 legendas):
1. "O barco das melhores sonecas da minha infância."
2. "O rádio de pilha oficial das Copas."
3. "A bicicleta com história (e 14 remendos)."

CARTA (dos netos): "Vô, a gente sabe as suas histórias de cor: o peixe-botijão, o gol narrado no rádio, a viagem de caminhão. E sabe por que a gente pede de novo? Não é pela história. É pra ver o senhor contando — o olho que acende, a mão que desenha o tamanho do peixe (sempre maior). Suas histórias são o nosso lugar favorito. Continua contando, vô. A gente continua fingindo surpresa. Combinado? — Seus netos"

MÚSICA: viola caipira instrumental
```

Nano Banana (4 fotos — avô ~80, netos variados):

```
1. Elderly Brazilian man on a small fishing boat at dawn, a boy asleep
   wrapped in his jacket beside him, misty lake, tender.
2. Same elderly man gesturing dramatically with open arms telling a story
   at a dinner table, grandchildren laughing, one rolling eyes fondly.
3. Old battery radio on a wooden shelf next to a faded football club
   pennant, nostalgic still life, afternoon light.
4. Same elderly man fixing an old bicycle with a teenage grandson handing
   him tools, garage clutter, patient teaching moment.
```

## 5.3 "Quatro gerações de nós" — para a bisavó

Emoção-alvo: matriarca viva vendo a árvore que plantou. Steps: capa, contador, timeline, carta, musica, encerramento.

```
seoSlug: avos-quatro-geracoes · persona: avó · ocasião: Dia dos Avós (bisavó)

CAPA: "Quatro gerações de nós" — Pra Bisa Maria, 94 anos, raiz de tudo isso aqui
CONTADOR: nascimento da bisa ("dias de Dona Maria no mundo — e o mundo agradece")

TIMELINE (5):
1. 1932 — Nasce Maria, no interior, numa casa de chão batido. Ninguém avisou o século do que vinha.
2. 1955 — 6 filhos criados na enxada e na fé. Sobrou amor pra plantação inteira.
3. 1987 — Chegam os netos: 14. Você decorou aniversário, apelido e comida favorita de todos.
4. 2012 — Chegam os bisnetos. Você, de touca de lã em pleno verão: "criança precisa de vó por perto".
5. 2026 — 94 anos, 4 gerações, 1 mesa que não cabe mais ninguém — e você na cabeceira, rindo.

CARTA (de todos): "Bisa, a senhora começou num chão batido e construiu chão pra todos nós pisarmos. São 6 filhos, 14 netos, 11 bisnetos — 31 pessoas que existem porque a senhora aguentou o que a gente nem imagina e sorriu mesmo assim. Quando a mesa enche no domingo e não cabe cadeira, olha bem: aquilo é a sua obra. A gente não é família grande, Bisa. A gente é a senhora, multiplicada. — Suas 4 gerações"

MÚSICA: "Asa Branca" suave ou hino que ela canta
ENCERRAMENTO: "◄◄ essa fita começou em 1932 e só melhora"
```

Nano Banana (4 fotos — bisavó ~94 + família):

```
1. Sepia 1950s photo of a young Brazilian woman with children in front of
   a simple rural house, dirt yard, dignified strong posture.
2. Elderly woman in her 90s wearing a wool cap, holding a baby, summer
   light, other family members around, warm chaos.
3. Four generations in one frame: great-grandmother seated, grandmother,
   mother and small child stacked hands, close-up.
4. Huge Sunday lunch, very long improvised table extending into the yard,
   tiny elderly woman at the head laughing, 30+ people.
```

## 5.4 "O estágio mais feliz do mundo" — para os avós de primeira viagem

Emoção-alvo: pais vendo os próprios pais virarem avós. Steps: capa, contador, galeria, numeros, carta, musica.

```
seoSlug: avos-primeira-viagem · persona: avó · ocasião: Dia dos Avós (avós recentes)

CAPA: "O estágio mais feliz do mundo" — Pros vovôs Neusa & Roberto, da estagiária Cecília (1 ano)
CONTADOR: nascimento da neta ("dias no cargo de avós — desempenho: acima do esperado")

GALERIA (5 legendas):
1. "Dia 1 no cargo: vocês brigaram (educadamente) por colo."
2. "Vô montou o berço 'sem manual'. Sobrou parafuso. O berço, milagrosamente, funciona."
3. "Vó, aquele papinho de 'não vou mimar' durou exatas 48 horas."
4. "Primeira palavra depois de mamãe e papai: 'vovó'. Vocês comemoraram por 3 dias."
5. "1 ano de Cecília, 1 ano dos avós mais coruja do hemisfério."

NÚMEROS: 365 dias de vovós · 4.380 fotos da neta no grupo da família · 2 aposentadorias dedicadas a 1 bebê

CARTA (dos pais): "Pai, mãe: a gente achou que conhecia vocês. Aí a Cecília nasceu e apareceram duas pessoas novas — o homem que fala fininho e a mulher que compra vestido tamanho 1 'porque estava com o preço bom' toda semana. Ver vocês serem avós é rever nossa infância de camarote: o mesmo colo, a mesma paciência, o dobro do deboche. Cecília ganhou os melhores. E nós, que já sabíamos, confirmamos. — Seus filhos (pais da chefinha)"

MÚSICA: "O Sol" — Vitor Kley ou instrumental alegre
```

Nano Banana (5 fotos — avós ~62 anos, bebê menina):

```
1. Brazilian grandparents at a maternity ward gently arguing over who holds
   the newborn, both reaching, playful tension, joy.
2. Grandfather assembling a crib surrounded by leftover screws and an
   ignored manual, focused pride, comedy of the scene.
3. Grandmother surrounded by tiny baby dresses with price tags still on,
   caught red-handed expression, shopping bags.
4. Grandparents on video call both squeezing into frame to see the baby,
   faces too close to camera, delight.
5. First birthday party: baby girl smashing cake while both grandparents
   clap in matching party hats.
```

---

# 6. Aniversário de Amizade

## 6.1 "15 anos de melhor amiga" — desde a escola

Emoção-alvo: amizade que atravessou todas as fases. Steps: capa, contador, timeline, numeros, carta, musica, encerramento.

```
seoSlug: amizade-desde-a-escola · persona: melhores amigas · ocasião: aniversário de amizade (15 anos)

CAPA: "15 anos dividindo o lanche e a vida" — Pra Carol, da Bia (sua sócia emocional desde 2011)
CONTADOR: primeiro dia de aula juntas ("dias de sociedade sem contrato")

TIMELINE (6):
1. 2011 — Você sentou do meu lado porque "a cadeira estava vazia". Nunca mais levantou.
2. 2013 — O trote que a gente sofreu junto virou a piada interna número 1 (de 947).
3. 2016 — Formatura: choramos abraçadas achando que ia ser difícil manter contato. Inocentes.
4. 2019 — Você atravessou a cidade às 2h da manhã com sorvete porque um boy me fez chorar. Ele era um erro. Você, um acerto.
5. 2023 — Madrinha do meu casamento. Seu discurso constrangedor segue sendo o melhor momento da festa.
6. 2026 — 15 anos. Novas cidades, novos empregos, mesmo grupo de figurinhas. Mesma gente.

NÚMEROS: 15 anos de amizade · 947 piadas internas catalogadas · 0 segredos guardados um da outra (fisicamente impossível)

CARTA: "Carol, dizem que amizade de escola não sobrevive à vida adulta. A gente sobreviveu a provas, boys errados, mudanças de cidade e àquele seu corte de cabelo de 2014 (que eu apoiei porque amiga apoia até o erro). Você é a irmã que eu escolhi numa cadeira vazia. Obrigada por 15 anos de sorvete de madrugada e verdade na cara. Que a gente vire duas velhinhas fofocando no mesmo grupo. — Bia"

MÚSICA: pop nostálgico da época da escola (hit de 2011)
ENCERRAMENTO: "◄◄ amizade boa a gente rebobina e assiste de novo"
```

Nano Banana (5 fotos — duas amigas dos 12 aos 27):

```
1. Two Brazilian schoolgirls in uniform sharing earphones at a school desk,
   early 2010s compact camera look, braces and laughter.
2. Two teenage girls crying and hugging in graduation gowns, mascara
   slightly smudged, celebratory chaos behind.
3. Two young women in pajamas eating ice cream from the pot on a sofa at
   2am, one consoling the other, tissues around, tender comedy.
4. Bride hugging her best friend (maid of honor) mid emotional toast,
   guests laughing and crying, wedding reception.
5. Two women in their late 20s taking the same selfie pose as photo 1,
   sharing earphones, recreation of the first photo.
```

## 6.2 "A república que virou família" — amigos de faculdade

Emoção-alvo: turma da faculdade/república. Steps: capa, timeline, numeros, galeria, carta, musica.

```
seoSlug: amizade-republica · persona: melhores amigas · ocasião: aniversário de amizade (10 anos da turma)

CAPA: "A república que virou família" — Pros 5 da Casa 42, de um de nós
TIMELINE (5):
1. 2016 — Cinco estranhos, uma casa caindo aos pedaços e um sofá achado na rua (nosso patrimônio).
2. 2017 — O miojo coletivo de fim de mês: 4 pacotes, 5 pessoas, matemática de amizade.
3. 2018 — A TCC WAR: revezamos o notebook bom e ninguém dormiu por uma semana. Todos passaram.
4. 2020 — A pandemia nos separou de casa. O grupo virou nossa república virtual. Chamada de 4 horas num domingo qualquer.
5. 2026 — Cada um numa cidade. Mas o encontro anual da Casa 42 é cláusula pétrea. Décima edição: confirmada.

NÚMEROS: 10 anos de Casa 42 · 1 sofá lendário (in memoriam) · 5 pessoas, 1 endereço emocional

GALERIA (3 legendas):
1. "O sofá. Achado na rua, aposentado com honras."
2. "A mesa da TCC WAR. Sobrevivemos todos."
3. "Encontro anual: a foto que a gente repete desde 2017."

CARTA: "Gente, a Casa 42 tinha infiltração, um sofá suspeito e a melhor população por metro quadrado do Brasil. A gente dividiu miojo, boleto, surto de TCC e crise existencial — e multiplicou tudo que importa. Dez anos depois, em cinco cidades diferentes, eu ainda chamo vocês de casa. Que nunca falte pauta no grupo e cadeira no encontro anual. Amo vocês, seus lixos. — Um de nós (vocês sabem qual)"

MÚSICA: hino da república (rock/pop BR de 2016)
```

Nano Banana (4 fotos — grupo de 5 amigos, 20 aos 30 anos):

```
1. Five Brazilian college students carrying an old sofa found on the street,
   mid-laughter, student neighborhood, golden hour.
2. Same five friends around a table covered in laptops, coffee cups and
   instant noodles at night, exhausted and united, TCC crunch.
3. Same group video call screenshot aesthetic: five faces in grid layout,
   pajamas, one holding a cat, pandemic era warmth.
4. Same five friends, now late 20s, recreating the sofa-carrying pose at a
   yearly reunion barbecue, same positions, older and happy.
```

## 6.3 "Um oceano e nenhuma distância" — amiga que mudou de país

Emoção-alvo: amizade à distância internacional. Steps: capa, contador, timeline, carta, musica, encerramento.

```
seoSlug: amizade-um-oceano · persona: melhores amigas · ocasião: aniversário de amizade (à distância)

CAPA: "Um oceano e nenhuma distância" — Pra Lu, de Lisboa pro meu coração em Curitiba
CONTADOR: dia do embarque dela ("dias sendo melhores amigas em fuso diferente")

TIMELINE (5):
1. 2008 — A gente se conheceu brigando pela mesma blusa na liquidação. A blusa era feia. A amizade, linda.
2. 2015 — Seu chá de despedida: eu fiz um discurso, chorei mais que você e roubei sua blusa (a feia). Justiça.
3. 2017 — Você me ligou às 4h da manhã (fuso, né) pra contar do pedido de casamento. Eu gritei. O prédio ouviu. Valeu.
4. 2021 — Sua filha nasceu e me chamaram de "dinda de longe". Cargo que exerço com envio mensal de mimo.
5. 2026 — 18 anos de amizade, 9 deles com um oceano no meio. O oceano perdeu.

CARTA: "Lu, a gente mede distância errado. Não são 7.700 km — são 2 horas de fuso, 1 áudio por dia e 1 'tô indo aí' por ano que sustenta tudo. Você do outro lado do mapa continua sendo a primeira pessoa pra quem eu conto qualquer coisa. Amizade de verdade não pede endereço, pede presença — e você nunca faltou. A blusa feia continua comigo. A vaga de melhor amiga também. Pra sempre. — Sua dinda de longe favorita"

MÚSICA: "Amiga da Minha Mulher" não rs — "Presente de um Beija-Flor" ou indie de saudade
ENCERRAMENTO: "◄◄ dá play que a saudade rebobina"
```

Nano Banana (4 fotos — duas amigas ~35 anos):

```
1. Two Brazilian women in their 20s laughing while tugging the same ugly
   patterned blouse at a store sale rack, 2008 look, candid.
2. Farewell party: one woman mid-speech crying dramatically while the other
   laughs and cries, "BOA VIAGEM" banner, fairy lights.
3. Split-scene style photo: woman on a video call at 4am in pajamas
   screaming with joy, city lights outside her window.
4. Airport arrivals gate: two women running into a hug, luggage abandoned
   behind, pure reunion energy.
```

## 6.4 "Irmãos que a vida escolheu" — amigos de infância, padrinhos um do outro

Emoção-alvo: amizade masculina de décadas, afeto que não se diz. Steps: capa, contador, timeline, numeros, carta, musica.

```
seoSlug: amizade-irmaos-da-vida · persona: melhores amigas · ocasião: aniversário de amizade (30 anos)

CAPA: "Irmãos que a vida escolheu" — Pro Léo, do Serginho (30 anos de rua sem saída)
CONTADOR: verão de 1996 ("dias desde o gol de placa na rua sem saída")

TIMELINE (5):
1. 1996 — Você mudou pra rua e quebrou minha janela com uma bicicleta de bola no primeiro dia. Amizade selada.
2. 2002 — O verão inteiro no videogame emprestado: 1 controle, revezamento por morte. Diplomacia avançada.
3. 2010 — Seu pai faleceu. Eu não sabia o que dizer. Fiquei do lado. Você depois disse que era isso.
4. 2019 — Padrinho do meu casamento. 2023: eu, padrinho do seu filho. A gente virou família no cartório e no coração.
5. 2026 — 30 anos: menos cabelo, mesma resenha, e o combinado de envelhecer jogando dominó tá de pé.

NÚMEROS: 30 anos de amizade · 1 janela quebrada (dívida perdoada) · 2 famílias que viraram 1

CARTA: "Léo, homem não fala dessas coisas, então vou escrever de uma vez e a gente nunca mais toca no assunto: você é o irmão que a vida me deu por acidente (literalmente, minha janela que o diga). 30 anos de zoeira, silêncio nas horas difíceis e presença em todas. Meu filho te chama de tio e não sabe o quanto isso é verdade. Obrigado por tudo, seu ruim de bola. Dominó aos 80 tá mantido. — Serginho"

MÚSICA: rock nacional dos anos 90 (ex.: Skank, "Amigo" clima)
```

Nano Banana (4 fotos — dois amigos dos 8 aos 38):

```
1. Two Brazilian boys around 8 years old on a dead-end street with bikes
   and a football, one pointing at a broken window, 90s film look, caught
   in the act.
2. Two teenagers playing video games on a tube TV, one controller between
   them, fan blowing, 2000s bedroom with posters.
3. Two grown men in suits laughing hard at a wedding, groom and best man,
   champagne glasses, genuine brotherhood.
4. Two men in their late 30s playing dominoes at a bar table, beers,
   mid-argument over the game, decades of intimacy visible.
```

---

## Checklist de produção

1. Gerar as fotos no Nano Banana (4–5 por exemplo, sempre com o sufixo de estilo global; manter personagens consistentes por set).
2. Subir os assets ao R2 com chave de seed (`seed/exemplos/<seoSlug>/<n>.webp`).
3. Colar no Claude Code: preâmbulo + spec do exemplo (um por vez), quando F1-1 (gift-schema) e F2-5 (seed-examples) estiverem prontos.
4. Cada exemplo vira página indexável — os seoSlugs acima já foram pensados para as landings de ocasião (F2-6).
